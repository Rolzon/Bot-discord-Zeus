import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import ms from 'ms';

export default {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Silencia temporalmente a un usuario')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuario a silenciar')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('duracion')
        .setDescription('Duración del timeout (ej: 10m, 1h, 1d)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('razon')
        .setDescription('Razón del timeout')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  
  async execute(interaction) {
    const target = interaction.options.getUser('usuario');
    const duration = interaction.options.getString('duracion');
    const reason = interaction.options.getString('razon') || 'No se especificó razón';
    const member = interaction.guild.members.cache.get(target.id);
    
    if (!member) {
      return interaction.reply({ content: '❌ Usuario no encontrado en el servidor.', ephemeral: true });
    }
    
    if (member.id === interaction.user.id) {
      return interaction.reply({ content: '❌ No puedes silenciarte a ti mismo.', ephemeral: true });
    }
    
    if (member.id === interaction.client.user.id) {
      return interaction.reply({ content: '❌ No puedo silenciarme a mí mismo.', ephemeral: true });
    }
    
    if (!member.moderatable) {
      return interaction.reply({ content: '❌ No puedo silenciar a este usuario.', ephemeral: true });
    }
    
    // Convertir duración a milisegundos
    const timeMs = ms(duration);
    
    if (!timeMs || timeMs < 1000 || timeMs > 2419200000) { // Max 28 días
      return interaction.reply({ content: '❌ Duración inválida. Usa formatos como: 10m, 1h, 1d (máximo 28 días)', ephemeral: true });
    }
    
    try {
      await member.timeout(timeMs, reason);
      
      // Enviar DM al usuario
      try {
        await target.send(`⏱️ Has sido silenciado en **${interaction.guild.name}**\n**Duración:** ${duration}\n**Razón:** ${reason}`);
      } catch (error) {
        console.log(`No se pudo enviar DM a ${target.tag}`);
      }
      
      const embed = new EmbedBuilder()
        .setColor('#808080')
        .setTitle('🔇 Usuario Silenciado')
        .setThumbnail(target.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: '👤 Usuario', value: `${target.tag}`, inline: true },
          { name: '👮 Moderador', value: interaction.user.tag, inline: true },
          { name: '⏱️ Duración', value: duration, inline: true },
          { name: '📝 Razón', value: reason },
          { name: '⏰ Expira', value: `<t:${Math.floor((Date.now() + timeMs) / 1000)}:R>` }
        )
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Error al silenciar:', error);
      await interaction.reply({ content: '❌ Hubo un error al silenciar al usuario.', ephemeral: true });
    }
  }
};
