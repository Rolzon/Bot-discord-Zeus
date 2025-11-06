import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Envía un anuncio al canal')
    .addStringOption(option =>
      option.setName('titulo')
        .setDescription('Título del anuncio')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('mensaje')
        .setDescription('Mensaje del anuncio')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('canal')
        .setDescription('Canal donde enviar el anuncio')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('color')
        .setDescription('Color del embed (hex, ej: #FF0000)')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  
  async execute(interaction) {
    const title = interaction.options.getString('titulo');
    const message = interaction.options.getString('mensaje');
    const channel = interaction.options.getChannel('canal') || interaction.channel;
    const color = interaction.options.getString('color') || interaction.client.config.embedColor;
    
    // Validar color hex
    const hexRegex = /^#[0-9A-F]{6}$/i;
    const embedColor = hexRegex.test(color) ? color : interaction.client.config.embedColor;
    
    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle('📢 ' + title)
      .setDescription(message)
      .setFooter({ text: `Anuncio por ${interaction.user.tag}` })
      .setTimestamp();
    
    try {
      await channel.send({ content: '@everyone', embeds: [embed] });
      await interaction.reply({ content: `✅ Anuncio enviado a ${channel}`, ephemeral: true });
    } catch (error) {
      console.error('Error enviando anuncio:', error);
      await interaction.reply({ content: '❌ No pude enviar el anuncio a ese canal.', ephemeral: true });
    }
  }
};
