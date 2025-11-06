import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Pregúntale a la bola 8 mágica')
    .addStringOption(option =>
      option.setName('pregunta')
        .setDescription('Tu pregunta')
        .setRequired(true)),
  
  async execute(interaction) {
    const question = interaction.options.getString('pregunta');
    
    const responses = [
      'Sí, definitivamente.',
      'Es cierto.',
      'Sin duda.',
      'Sí, absolutamente.',
      'Puedes confiar en ello.',
      'Como yo lo veo, sí.',
      'Muy probablemente.',
      'Las perspectivas son buenas.',
      'Sí.',
      'Las señales apuntan a que sí.',
      'Respuesta confusa, intenta de nuevo.',
      'Pregunta de nuevo más tarde.',
      'Mejor no decirte ahora.',
      'No puedo predecirlo ahora.',
      'Concéntrate y pregunta de nuevo.',
      'No cuentes con ello.',
      'Mi respuesta es no.',
      'Mis fuentes dicen que no.',
      'Las perspectivas no son tan buenas.',
      'Muy dudoso.'
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    const embed = new EmbedBuilder()
      .setColor(interaction.client.config.embedColor)
      .setTitle('🎱 Bola 8 Mágica')
      .addFields(
        { name: '❓ Pregunta', value: question },
        { name: '💭 Respuesta', value: response }
      )
      .setFooter({ text: `Preguntado por ${interaction.user.tag}` })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};
