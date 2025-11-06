import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Muestra la latencia del bot'),
  
  async execute(interaction) {
    const sent = await interaction.reply({ content: '🏓 Calculando ping...', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);
    
    const embed = new EmbedBuilder()
      .setColor(interaction.client.config.embedColor)
      .setTitle('🏓 Pong!')
      .addFields(
        { name: '📡 Latencia', value: `${latency}ms`, inline: true },
        { name: '💓 API', value: `${apiLatency}ms`, inline: true }
      )
      .setTimestamp();
    
    await interaction.editReply({ content: null, embeds: [embed] });
  }
};
