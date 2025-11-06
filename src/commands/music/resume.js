import { SlashCommandBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';

export default {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Reanuda la música pausada'),
  
  async execute(interaction) {
    const player = useMainPlayer();
    const queue = player.nodes.get(interaction.guildId);
    
    if (!queue) {
      return interaction.reply({ content: '❌ No hay música en la cola.', ephemeral: true });
    }
    
    if (!queue.node.isPaused()) {
      return interaction.reply({ content: '❌ La música no está pausada.', ephemeral: true });
    }
    
    queue.node.resume();
    await interaction.reply('▶️ Música reanudada.');
  }
};
