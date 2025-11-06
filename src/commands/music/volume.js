import { SlashCommandBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';

export default {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Ajusta el volumen de la música')
    .addIntegerOption(option =>
      option.setName('nivel')
        .setDescription('Nivel de volumen (0-100)')
        .setMinValue(0)
        .setMaxValue(100)
        .setRequired(true)),
  
  async execute(interaction) {
    const player = useMainPlayer();
    const queue = player.nodes.get(interaction.guildId);
    const volume = interaction.options.getInteger('nivel');
    
    if (!queue) {
      return interaction.reply({ content: '❌ No hay música reproduciéndose.', ephemeral: true });
    }
    
    queue.node.setVolume(volume);
    await interaction.reply(`🔊 Volumen ajustado a **${volume}%**`);
  }
};
