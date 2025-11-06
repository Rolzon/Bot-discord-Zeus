import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';

export default {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Muestra la canción actual'),
  
  async execute(interaction) {
    const player = useMainPlayer();
    const queue = player.nodes.get(interaction.guildId);
    
    if (!queue || !queue.currentTrack) {
      return interaction.reply({ content: '❌ No hay música reproduciéndose.', ephemeral: true });
    }
    
    const track = queue.currentTrack;
    const progress = queue.node.createProgressBar();
    
    const embed = new EmbedBuilder()
      .setColor(interaction.client.config.embedColor)
      .setTitle('🎵 Reproduciendo Ahora')
      .setDescription(`[${track.title}](${track.url})`)
      .addFields(
        { name: '👤 Autor', value: track.author, inline: true },
        { name: '⏱️ Duración', value: track.duration, inline: true },
        { name: '🔊 Volumen', value: `${queue.node.volume}%`, inline: true },
        { name: '📊 Progreso', value: progress }
      )
      .setThumbnail(track.thumbnail)
      .setFooter({ text: `Solicitado por ${track.requestedBy.tag}` })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};
