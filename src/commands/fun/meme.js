import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Genera un meme aleatorio'),
  
  cooldown: 5,
  
  async execute(interaction) {
    await interaction.deferReply();
    
    try {
      // Usar API de memes de Reddit
      const response = await fetch('https://meme-api.com/gimme');
      const data = await response.json();
      
      if (!data.url) {
        return interaction.editReply({ content: '❌ No se pudo obtener un meme. Intenta de nuevo.' });
      }
      
      const embed = new EmbedBuilder()
        .setColor(interaction.client.config.embedColor)
        .setTitle(data.title)
        .setImage(data.url)
        .setFooter({ text: `👍 ${data.ups} | r/${data.subreddit}` })
        .setTimestamp();
      
      await interaction.editReply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Error obteniendo meme:', error);
      await interaction.editReply({ content: '❌ Hubo un error al obtener el meme.' });
    }
  }
};
