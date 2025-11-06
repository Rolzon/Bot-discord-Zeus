import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Muestra información de un usuario')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuario a consultar')
        .setRequired(false)),
  
  async execute(interaction) {
    const target = interaction.options.getUser('usuario') || interaction.user;
    const member = interaction.guild.members.cache.get(target.id);
    
    const embed = new EmbedBuilder()
      .setColor(interaction.client.config.embedColor)
      .setTitle(`👤 Información de ${target.tag}`)
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '🆔 ID', value: target.id, inline: true },
        { name: '📅 Cuenta creada', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`, inline: true },
        { name: '🤖 Bot', value: target.bot ? 'Sí' : 'No', inline: true }
      );
    
    if (member) {
      embed.addFields(
        { name: '📥 Se unió', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
        { name: '🎨 Color de rol', value: member.displayHexColor, inline: true },
        { name: '🎭 Roles', value: member.roles.cache.size.toString(), inline: true }
      );
      
      const roles = member.roles.cache
        .filter(role => role.id !== interaction.guild.id)
        .sort((a, b) => b.position - a.position)
        .map(role => role.toString())
        .slice(0, 10);
      
      if (roles.length > 0) {
        embed.addFields({ name: '📋 Roles principales', value: roles.join(', ') });
      }
      
      if (member.premiumSince) {
        embed.addFields({ name: '💎 Boosting desde', value: `<t:${Math.floor(member.premiumSinceTimestamp / 1000)}:R>`, inline: true });
      }
    }
    
    await interaction.reply({ embeds: [embed] });
  }
};
