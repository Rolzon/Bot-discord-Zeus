import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';

export default {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Reproduce música desde YouTube, Spotify, etc.')
    .addStringOption(option =>
      option.setName('cancion')
        .setDescription('Nombre de la canción o URL')
        .setRequired(true)),
  
  async execute(interaction) {
    const player = useMainPlayer();
    const query = interaction.options.getString('cancion');
    const channel = interaction.member.voice.channel;
    
    if (!channel) {
      return interaction.reply({ content: '❌ Debes estar en un canal de voz para usar este comando.', ephemeral: true });
    }
    
    await interaction.deferReply();
    
    try {
      const { track, searchResult } = await player.play(channel, query, {
        nodeOptions: {
          metadata: {
            channel: interaction.channel,
            client: interaction.guild.members.me,
            requestedBy: interaction.user
          }
        }
      });
      
      const embed = new EmbedBuilder()
        .setColor(interaction.client.config.embedColor)
        .setTitle('🎵 Reproduciendo')
        .setDescription(`[${track.title}](${track.url})`)
        .addFields(
          { name: '👤 Autor', value: track.author, inline: true },
          { name: '⏱️ Duración', value: track.duration, inline: true },
          { name: '📝 Solicitado por', value: interaction.user.tag, inline: true }
        )
        .setThumbnail(track.thumbnail)
        .setTimestamp();
      
      return interaction.editReply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Error reproduciendo música:', error);
      return interaction.editReply({ content: `❌ Error: ${error.message}` });
    }
  }
};
