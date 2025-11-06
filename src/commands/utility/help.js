import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Muestra todos los comandos disponibles'),
  
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(interaction.client.config.embedColor)
      .setTitle('📚 Lista de Comandos (60+ Comandos)')
      .setDescription('Bot multi-propósito completo estilo Drako Bot')
      .addFields(
        {
          name: '🛡️ Moderación',
          value: '`/kick` `/ban` `/unban` `/warn` `/warnings`\n' +
                 '`/clearwarnings` `/timeout` `/untimeout` `/clear`'
        },
        {
          name: '🎵 Música',
          value: '`/play` `/pause` `/resume` `/skip` `/stop`\n' +
                 '`/queue` `/volume` `/nowplaying`'
        },
        {
          name: '🎫 Tickets',
          value: '`/ticket-setup` `/ticket-close`\n' +
                 '`/ticket-add` `/ticket-remove`'
        },
        {
          name: '🎉 Sorteos',
          value: '`/giveaway-start` `/giveaway-end` `/giveaway-reroll`'
        },
        {
          name: '📊 Niveles y XP',
          value: '`/rank` `/leaderboard` `/setlevel` `/resetlevels`\n' +
                 '**Gana XP automáticamente enviando mensajes!**'
        },
        {
          name: '💾 Backups',
          value: '`/backup-create` - Crea backup completo del servidor'
        },
        {
          name: '🛡️ Anti-Raid',
          value: '`/antiraid` `/lockdown` `/antispam`\n' +
                 '`/nuke` `/massban`'
        },
        {
          name: '🔧 Utilidad',
          value: '`/poll` `/announce` `/role` `/serverinfo`\n' +
                 '`/userinfo` `/avatar` `/ping`'
        },
        {
          name: '🎮 Diversión',
          value: '`/8ball` `/dice` `/coinflip` `/meme` `/say`'
        },
        {
          name: '🤖 IA (GPT-3.5) + Base de Conocimiento',
          value: 'Menciona al bot para conversar con IA\n' +
                 'Ejemplo: `@bot ¿Cómo estás?`\n' +
                 '`/kb-add` `/kb-list` `/kb-remove` `/kb-reload`\n' +
                 '**¡Añade FAQs personalizadas de tu negocio!**'
        }
      )
      .setFooter({ text: `Bot multi-propósito con Discord.js, OpenAI y discord-player` })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};
