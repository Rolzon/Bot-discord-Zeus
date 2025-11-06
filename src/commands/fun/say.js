import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Haz que el bot diga algo')
    .addStringOption(option =>
      option.setName('mensaje')
        .setDescription('Mensaje a enviar')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('canal')
        .setDescription('Canal donde enviar el mensaje')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  
  async execute(interaction) {
    const message = interaction.options.getString('mensaje');
    const channel = interaction.options.getChannel('canal') || interaction.channel;
    
    try {
      await channel.send(message);
      await interaction.reply({ content: `✅ Mensaje enviado a ${channel}`, ephemeral: true });
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      await interaction.reply({ content: '❌ No pude enviar el mensaje a ese canal.', ephemeral: true });
    }
  }
};
