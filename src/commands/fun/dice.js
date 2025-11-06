import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('Lanza un dado')
    .addIntegerOption(option =>
      option.setName('caras')
        .setDescription('Número de caras del dado (por defecto 6)')
        .setMinValue(2)
        .setMaxValue(100)
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('cantidad')
        .setDescription('Cantidad de dados a lanzar (por defecto 1)')
        .setMinValue(1)
        .setMaxValue(10)
        .setRequired(false)),
  
  async execute(interaction) {
    const sides = interaction.options.getInteger('caras') || 6;
    const count = interaction.options.getInteger('cantidad') || 1;
    
    const results = [];
    let total = 0;
    
    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * sides) + 1;
      results.push(roll);
      total += roll;
    }
    
    const embed = new EmbedBuilder()
      .setColor(interaction.client.config.embedColor)
      .setTitle('🎲 Lanzamiento de Dados')
      .addFields(
        { name: '🎯 Configuración', value: `${count}d${sides}`, inline: true },
        { name: '📊 Resultados', value: results.join(', '), inline: true },
        { name: '➕ Total', value: total.toString(), inline: true }
      )
      .setFooter({ text: `Lanzado por ${interaction.user.tag}` })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};
