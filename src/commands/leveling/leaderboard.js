import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getLeaderboard } from '../../database/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Muestra el ranking de niveles del servidor'),
  
  async execute(interaction) {
    // Intentar obtener de MongoDB
    let topUsers = await getLeaderboard(interaction.guildId, 10);
    
    // Fallback a memoria si MongoDB no está disponible
    if (topUsers.length === 0) {
      const allUsers = Array.from(interaction.client.data.levels.entries())
        .filter(([key]) => key.startsWith(interaction.guildId))
        .sort((a, b) => b[1].xp - a[1].xp)
        .slice(0, 10);
      
      if (allUsers.length === 0) {
        return interaction.reply({ content: '❌ No hay datos de niveles aún.', ephemeral: true });
      }
      
      // Convertir formato de memoria a formato de MongoDB
      topUsers = allUsers.map(([key, data]) => ({
        userId: key.split('-')[1],
        username: '',
        level: data.level,
        xp: data.xp,
        messages: data.messages
      }));
    }
    
    const leaderboard = await Promise.all(
      topUsers.map(async (data, index) => {
        try {
          const user = await interaction.client.users.fetch(data.userId);
          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
          return `${medal} **${user.tag}** - Nivel ${data.level} (${data.xp} XP)`;
        } catch (error) {
          return null;
        }
      })
    );
    
    const embed = new EmbedBuilder()
      .setColor(interaction.client.config.embedColor)
      .setTitle('🏆 Ranking de Niveles')
      .setDescription(leaderboard.filter(l => l !== null).join('\n'))
      .setFooter({ text: `Top 10 de ${interaction.guild.name}` })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};
