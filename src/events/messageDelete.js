import { Events, EmbedBuilder } from 'discord.js';

export default {
  name: Events.MessageDelete,
  async execute(message) {
    if (message.author?.bot) return;
    
    const logChannel = message.guild.channels.cache.find(
      ch => ch.name === message.client.config.logChannel
    );
    
    if (!logChannel) return;
    
    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('🗑️ Mensaje Eliminado')
      .addFields(
        { name: '👤 Autor', value: message.author ? message.author.tag : 'Desconocido', inline: true },
        { name: '📍 Canal', value: `${message.channel}`, inline: true },
        { name: '📅 Fecha', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
      )
      .setTimestamp();
    
    if (message.content) {
      embed.addFields({ name: '💬 Contenido', value: message.content.substring(0, 1024) });
    }
    
    if (message.attachments.size > 0) {
      embed.addFields({ name: '📎 Adjuntos', value: `${message.attachments.size} archivo(s)` });
    }
    
    try {
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error enviando log de mensaje eliminado:', error);
    }
  }
};
