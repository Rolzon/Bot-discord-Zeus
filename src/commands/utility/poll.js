import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Crea una encuesta')
    .addStringOption(option =>
      option.setName('pregunta')
        .setDescription('Pregunta de la encuesta')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('opciones')
        .setDescription('Opciones separadas por | (máximo 10)')
        .setRequired(true)),
  
  async execute(interaction) {
    const question = interaction.options.getString('pregunta');
    const optionsString = interaction.options.getString('opciones');
    const options = optionsString.split('|').map(opt => opt.trim()).filter(opt => opt.length > 0);
    
    if (options.length < 2) {
      return interaction.reply({ content: '❌ Debes proporcionar al menos 2 opciones.', ephemeral: true });
    }
    
    if (options.length > 10) {
      return interaction.reply({ content: '❌ Máximo 10 opciones permitidas.', ephemeral: true });
    }
    
    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    
    const description = options.map((option, index) => 
      `${emojis[index]} ${option}`
    ).join('\n\n');
    
    const embed = new EmbedBuilder()
      .setColor(interaction.client.config.embedColor)
      .setTitle('📊 ' + question)
      .setDescription(description)
      .setFooter({ text: `Encuesta creada por ${interaction.user.tag}` })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
    
    const message = await interaction.fetchReply();
    
    // Agregar reacciones
    for (let i = 0; i < options.length; i++) {
      await message.react(emojis[i]);
    }
  }
};
