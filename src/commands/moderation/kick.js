import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulsa a un usuario del servidor')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuario a expulsar')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('razon')
        .setDescription('Razón de la expulsión')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  
  async execute(interaction) {
    const target = interaction.options.getUser('usuario');
    const reason = interaction.options.getString('razon') || 'No se especificó razón';
    const member = interaction.guild.members.cache.get(target.id);
    
    if (!member) {
      return interaction.reply({ content: '❌ Usuario no encontrado en el servidor.', ephemeral: true });
    }
    
    if (member.id === interaction.user.id) {
      return interaction.reply({ content: '❌ No puedes expulsarte a ti mismo.', ephemeral: true });
    }
    
    if (member.id === interaction.client.user.id) {
      return interaction.reply({ content: '❌ No puedo expulsarme a mí mismo.', ephemeral: true });
    }
    
    if (!member.kickable) {
      return interaction.reply({ content: '❌ No puedo expulsar a este usuario. Puede tener un rol superior al mío.', ephemeral: true });
    }
    
    // Intentar enviar DM al usuario
    try {
      await target.send(`Has sido expulsado de **${interaction.guild.name}**\n**Razón:** ${reason}`);
    } catch (error) {
      console.log(`No se pudo enviar DM a ${target.tag}`);
    }
    
    // Expulsar usuario
    try {
      await member.kick(reason);
      
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('👢 Usuario Expulsado')
        .setThumbnail(target.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: '👤 Usuario', value: `${target.tag} (${target.id})`, inline: true },
          { name: '👮 Moderador', value: interaction.user.tag, inline: true },
          { name: '📝 Razón', value: reason }
        )
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Error al expulsar:', error);
      await interaction.reply({ content: '❌ Hubo un error al expulsar al usuario.', ephemeral: true });
    }
  }
};
