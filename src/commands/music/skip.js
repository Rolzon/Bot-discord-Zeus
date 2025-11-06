import { SlashCommandBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';

export default {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Salta a la siguiente canción'),
  
  async execute(interaction) {
    const player = useMainPlayer();
    const queue = player.nodes.get(interaction.guildId);
    
    if (!queue || !queue.isPlaying()) {
      return interaction.reply({ content: '❌ No hay música reproduciéndose.', ephemeral: true });
    }
    
    const currentTrack = queue.currentTrack;
    queue.node.skip();
    
    await interaction.reply(`⏭️ Saltando **${currentTrack.title}**`);
  }
};
