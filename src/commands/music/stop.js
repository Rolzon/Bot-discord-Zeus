import { SlashCommandBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';

export default {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Detiene la música y limpia la cola'),
  
  async execute(interaction) {
    const player = useMainPlayer();
    const queue = player.nodes.get(interaction.guildId);
    
    if (!queue) {
      return interaction.reply({ content: '❌ No hay música reproduciéndose.', ephemeral: true });
    }
    
    queue.delete();
    await interaction.reply('⏹️ Música detenida y cola limpiada.');
  }
};
