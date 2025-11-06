import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { addWarning } from '../../database/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Advierte a un usuario')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuario a advertir')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('razon')
        .setDescription('Razón de la advertencia')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  
  async execute(interaction) {
    const target = interaction.options.getUser('usuario');
    const reason = interaction.options.getString('razon');
    const member = interaction.guild.members.cache.get(target.id);
    
    if (!member) {
      return interaction.reply({ content: '❌ Usuario no encontrado en el servidor.', ephemeral: true });
    }
    
    if (member.id === interaction.user.id) {
      return interaction.reply({ content: '❌ No puedes advertirte a ti mismo.', ephemeral: true });
    }
    
    // Agregar advertencia en MongoDB
    let warnings = await addWarning(
      interaction.guild.id,
      target.id,
      reason,
      interaction.user.tag,
      target.tag
    );
    
    // Fallback a memoria si MongoDB no está disponible
    if (!warnings) {
      const userId = `${interaction.guild.id}-${target.id}`;
      warnings = interaction.client.data.warnings.get(userId) || [];
      
      warnings.push({
        reason: reason,
        moderator: interaction.user.tag,
        timestamp: Date.now()
      });
      
      interaction.client.data.warnings.set(userId, warnings);
      await interaction.client.data.save();
    }
    
    const warningCount = warnings.length;
    
    // Enviar DM al usuario
    try {
      await target.send(`⚠️ Has recibido una advertencia en **${interaction.guild.name}**\n**Razón:** ${reason}\n**Advertencias totales:** ${warningCount}/${interaction.client.config.maxWarnings}`);
    } catch (error) {
      console.log(`No se pudo enviar DM a ${target.tag}`);
    }
    
    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('⚠️ Usuario Advertido')
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '👤 Usuario', value: `${target.tag}`, inline: true },
        { name: '👮 Moderador', value: interaction.user.tag, inline: true },
        { name: '📝 Razón', value: reason },
        { name: '⚠️ Advertencias', value: `${warningCount}/${interaction.client.config.maxWarnings}`, inline: true }
      )
      .setTimestamp();
    
    // Acción automática si alcanza el máximo de advertencias
    if (warningCount >= interaction.client.config.maxWarnings) {
      try {
        await member.kick(`Alcanzó el máximo de advertencias (${interaction.client.config.maxWarnings})`);
        embed.addFields({ name: '👢 Acción', value: 'Usuario expulsado automáticamente por alcanzar el máximo de advertencias' });
        interaction.client.data.warnings.delete(userId);
        await interaction.client.data.save();
      } catch (error) {
        console.error('Error al expulsar automáticamente:', error);
      }
    }
    
    await interaction.reply({ embeds: [embed] });
  }
};
