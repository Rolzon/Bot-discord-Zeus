import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ticket-add')
    .setDescription('Añade un usuario al ticket')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuario a añadir')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  
  async execute(interaction) {
    const channel = interaction.channel;
    const user = interaction.options.getUser('usuario');
    
    if (!channel.name.startsWith('ticket-')) {
      return interaction.reply({ content: '❌ Este comando solo puede usarse en canales de tickets.', ephemeral: true });
    }
    
    try {
      await channel.permissionOverwrites.create(user, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true
      });
      
      await interaction.reply(`✅ ${user} ha sido añadido al ticket.`);
    } catch (error) {
      console.error('Error añadiendo usuario:', error);
      await interaction.reply({ content: '❌ Error al añadir el usuario.', ephemeral: true });
    }
  }
};
