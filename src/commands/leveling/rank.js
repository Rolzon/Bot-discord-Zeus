import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Muestra tu nivel y XP')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuario a consultar')
        .setRequired(false)),
  
  async execute(interaction) {
    const target = interaction.options.getUser('usuario') || interaction.user;
    const userId = `${interaction.guildId}-${target.id}`;
    const userData = interaction.client.data.levels.get(userId) || { xp: 0, level: 0, messages: 0 };
    
    const xpNeeded = calculateXPForLevel(userData.level + 1);
    const progress = Math.floor((userData.xp / xpNeeded) * 100);
    
    // Calcular ranking
    const allUsers = Array.from(interaction.client.data.levels.entries())
      .filter(([key]) => key.startsWith(interaction.guildId))
      .sort((a, b) => b[1].xp - a[1].xp);
    
    const rank = allUsers.findIndex(([key]) => key === userId) + 1;
    
    const embed = new EmbedBuilder()
      .setColor(interaction.client.config.embedColor)
      .setTitle(`📊 Nivel de ${target.tag}`)
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '📈 Nivel', value: userData.level.toString(), inline: true },
        { name: '⭐ XP', value: `${userData.xp}/${xpNeeded}`, inline: true },
        { name: '🏆 Ranking', value: `#${rank}`, inline: true },
        { name: '💬 Mensajes', value: userData.messages.toString(), inline: true },
        { name: '📊 Progreso', value: createProgressBar(progress) }
      )
      .setFooter({ text: `${progress}% al siguiente nivel` })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};

function calculateXPForLevel(level) {
  return 5 * (level ** 2) + 50 * level + 100;
}

function createProgressBar(percentage) {
  const filled = Math.floor(percentage / 10);
  const empty = 10 - filled;
  return '▰'.repeat(filled) + '▱'.repeat(empty) + ` ${percentage}%`;
}
