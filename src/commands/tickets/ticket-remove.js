import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ticket-remove')
    .setDescription('Quita un usuario del ticket')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuario a quitar')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  
  async execute(interaction) {
    const channel = interaction.channel;
    const user = interaction.options.getUser('usuario');
    
    if (!channel.name.startsWith('ticket-')) {
      return interaction.reply({ content: '❌ Este comando solo puede usarse en canales de tickets.', ephemeral: true });
    }
    
    try {
      await channel.permissionOverwrites.delete(user);
      await interaction.reply(`✅ ${user} ha sido quitado del ticket.`);
    } catch (error) {
      console.error('Error quitando usuario:', error);
      await interaction.reply({ content: '❌ Error al quitar el usuario.', ephemeral: true });
    }
  }
};
