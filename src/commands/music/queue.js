import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';

export default {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Muestra la cola de reproducción'),
  
  async execute(interaction) {
    const player = useMainPlayer();
    const queue = player.nodes.get(interaction.guildId);
    
    if (!queue || !queue.currentTrack) {
      return interaction.reply({ content: '❌ No hay música en la cola.', ephemeral: true });
    }
    
    const currentTrack = queue.currentTrack;
    const tracks = queue.tracks.toArray();
    
    const embed = new EmbedBuilder()
      .setColor(interaction.client.config.embedColor)
      .setTitle('🎵 Cola de Reproducción')
      .setDescription(`**Reproduciendo ahora:**\n[${currentTrack.title}](${currentTrack.url}) - \`${currentTrack.duration}\``)
      .setThumbnail(currentTrack.thumbnail);
    
    if (tracks.length > 0) {
      const queueList = tracks.slice(0, 10).map((track, index) => 
        `**${index + 1}.** [${track.title}](${track.url}) - \`${track.duration}\``
      ).join('\n');
      
      embed.addFields({ name: '📝 Próximas canciones', value: queueList });
      
      if (tracks.length > 10) {
        embed.setFooter({ text: `Y ${tracks.length - 10} canciones más...` });
      }
    } else {
      embed.addFields({ name: '📝 Próximas canciones', value: 'No hay más canciones en la cola' });
    }
    
    await interaction.reply({ embeds: [embed] });
  }
};
