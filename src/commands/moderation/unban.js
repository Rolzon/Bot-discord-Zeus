import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Desbanea a un usuario del servidor')
    .addStringOption(option =>
      option.setName('userid')
        .setDescription('ID del usuario a desbanear')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('razon')
        .setDescription('Razón del desbaneo')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  
  async execute(interaction) {
    const userId = interaction.options.getString('userid');
    const reason = interaction.options.getString('razon') || 'No se especificó razón';
    
    try {
      // Verificar si el usuario está baneado
      const bans = await interaction.guild.bans.fetch();
      const bannedUser = bans.get(userId);
      
      if (!bannedUser) {
        return interaction.reply({ content: '❌ Este usuario no está baneado.', ephemeral: true });
      }
      
      // Desbanear usuario
      await interaction.guild.members.unban(userId, reason);
      
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Usuario Desbaneado')
        .addFields(
          { name: '👤 Usuario', value: `${bannedUser.user.tag} (${userId})`, inline: true },
          { name: '👮 Moderador', value: interaction.user.tag, inline: true },
          { name: '📝 Razón', value: reason }
        )
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Error al desbanear:', error);
      await interaction.reply({ content: '❌ Hubo un error al desbanear al usuario. Verifica que el ID sea correcto.', ephemeral: true });
    }
  }
};
