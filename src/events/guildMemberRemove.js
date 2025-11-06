import { Events, EmbedBuilder } from 'discord.js';

export default {
  name: Events.GuildMemberRemove,
  async execute(member) {
    const logChannel = member.guild.channels.cache.find(
      ch => ch.name === member.client.config.logChannel
    );
    
    if (!logChannel) return;
    
    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('👋 Miembro Salió')
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '👤 Usuario', value: `${member.user.tag} (${member.id})`, inline: true },
        { name: '📊 Miembros totales', value: member.guild.memberCount.toString(), inline: true },
        { name: '📅 Se unió', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true }
      )
      .setTimestamp();
    
    try {
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error enviando log de miembro salió:', error);
    }
  }
};
