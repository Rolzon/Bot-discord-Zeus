import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Muestra el avatar de un usuario')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuario a consultar')
        .setRequired(false)),
  
  async execute(interaction) {
    const target = interaction.options.getUser('usuario') || interaction.user;
    
    const embed = new EmbedBuilder()
      .setColor(interaction.client.config.embedColor)
      .setTitle(`Avatar de ${target.tag}`)
      .setImage(target.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setDescription(`[Descargar](${target.displayAvatarURL({ dynamic: true, size: 1024 })})`)
      .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};
