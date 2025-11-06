import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Lanza una moneda'),
  
  async execute(interaction) {
    const result = Math.random() < 0.5 ? 'Cara' : 'Cruz';
    const emoji = result === 'Cara' ? '🪙' : '💿';
    
    const embed = new EmbedBuilder()
      .setColor(interaction.client.config.embedColor)
      .setTitle('🪙 Lanzamiento de Moneda')
      .setDescription(`${emoji} **${result}**`)
      .setFooter({ text: `Lanzado por ${interaction.user.tag}` })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};
