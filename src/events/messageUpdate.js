import { Events, EmbedBuilder } from 'discord.js';

export default {
  name: Events.MessageUpdate,
  async execute(oldMessage, newMessage) {
    if (newMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return;
    
    const logChannel = newMessage.guild.channels.cache.find(
      ch => ch.name === newMessage.client.config.logChannel
    );
    
    if (!logChannel) return;
    
    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('✏️ Mensaje Editado')
      .addFields(
        { name: '👤 Autor', value: newMessage.author.tag, inline: true },
        { name: '📍 Canal', value: `${newMessage.channel}`, inline: true },
        { name: '🔗 Link', value: `[Ir al mensaje](${newMessage.url})`, inline: true }
      )
      .setTimestamp();
    
    if (oldMessage.content) {
      embed.addFields({ name: '📝 Antes', value: oldMessage.content.substring(0, 1024) });
    }
    
    if (newMessage.content) {
      embed.addFields({ name: '📝 Después', value: newMessage.content.substring(0, 1024) });
    }
    
    try {
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error enviando log de mensaje editado:', error);
    }
  }
};
