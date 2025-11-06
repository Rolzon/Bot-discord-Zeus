import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Banea a un usuario del servidor')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuario a banear')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('razon')
        .setDescription('Razón del baneo')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('dias')
        .setDescription('Días de mensajes a eliminar (0-7)')
        .setMinValue(0)
        .setMaxValue(7)
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  
  async execute(interaction) {
    const target = interaction.options.getUser('usuario');
    const reason = interaction.options.getString('razon') || 'No se especificó razón';
    const deleteMessageDays = interaction.options.getInteger('dias') || 0;
    const member = interaction.guild.members.cache.get(target.id);
    
    if (member) {
      if (member.id === interaction.user.id) {
        return interaction.reply({ content: '❌ No puedes banearte a ti mismo.', ephemeral: true });
      }
      
      if (member.id === interaction.client.user.id) {
        return interaction.reply({ content: '❌ No puedo banearme a mí mismo.', ephemeral: true });
      }
      
      if (!member.bannable) {
        return interaction.reply({ content: '❌ No puedo banear a este usuario. Puede tener un rol superior al mío.', ephemeral: true });
      }
    }
    
    // Intentar enviar DM al usuario
    try {
      await target.send(`Has sido baneado de **${interaction.guild.name}**\n**Razón:** ${reason}`);
    } catch (error) {
      console.log(`No se pudo enviar DM a ${target.tag}`);
    }
    
    // Banear usuario
    try {
      await interaction.guild.members.ban(target, {
        reason: reason,
        deleteMessageSeconds: deleteMessageDays * 24 * 60 * 60
      });
      
      const embed = new EmbedBuilder()
        .setColor('#8B0000')
        .setTitle('🔨 Usuario Baneado')
        .setThumbnail(target.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: '👤 Usuario', value: `${target.tag} (${target.id})`, inline: true },
          { name: '👮 Moderador', value: interaction.user.tag, inline: true },
          { name: '📝 Razón', value: reason },
          { name: '🗑️ Mensajes eliminados', value: `${deleteMessageDays} días`, inline: true }
        )
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Error al banear:', error);
      await interaction.reply({ content: '❌ Hubo un error al banear al usuario.', ephemeral: true });
    }
  }
};
