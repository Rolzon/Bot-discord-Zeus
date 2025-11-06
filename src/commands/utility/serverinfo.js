import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Muestra información del servidor'),
  
  async execute(interaction) {
    const { guild } = interaction;
    
    const embed = new EmbedBuilder()
      .setColor(interaction.client.config.embedColor)
      .setTitle(`📊 Información de ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: '👑 Dueño', value: `<@${guild.ownerId}>`, inline: true },
        { name: '📅 Creado', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
        { name: '🆔 ID', value: guild.id, inline: true },
        { name: '👥 Miembros', value: guild.memberCount.toString(), inline: true },
        { name: '💬 Canales', value: guild.channels.cache.size.toString(), inline: true },
        { name: '🎭 Roles', value: guild.roles.cache.size.toString(), inline: true },
        { name: '😀 Emojis', value: guild.emojis.cache.size.toString(), inline: true },
        { name: '🚀 Boost', value: `Nivel ${guild.premiumTier} (${guild.premiumSubscriptionCount} boosts)`, inline: true },
        { name: '🔒 Nivel de verificación', value: guild.verificationLevel.toString(), inline: true }
      )
      .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
      .setTimestamp();
    
    if (guild.description) {
      embed.setDescription(guild.description);
    }
    
    await interaction.reply({ embeds: [embed] });
  }
};
