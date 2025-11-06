import { Events, EmbedBuilder } from 'discord.js';

export default {
  name: Events.GuildMemberAdd,
  async execute(member) {
    // Buscar canal de bienvenida
    const welcomeChannel = member.guild.channels.cache.find(
      ch => ch.name === member.client.config.welcomeChannel
    );
    
    if (!welcomeChannel) return;
    
    // Crear embed de bienvenida
    const welcomeEmbed = new EmbedBuilder()
      .setColor(member.client.config.embedColor)
      .setTitle('¡Bienvenido al servidor! 🎉')
      .setDescription(`¡Hola ${member}! Bienvenido a **${member.guild.name}**`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '👤 Usuario', value: member.user.tag, inline: true },
        { name: '📊 Miembro #', value: member.guild.memberCount.toString(), inline: true },
        { name: '📅 Cuenta creada', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true }
      )
      .setFooter({ text: `ID: ${member.id}` })
      .setTimestamp();
    
    // Buscar canal de reglas
    const rulesChannel = member.guild.channels.cache.find(
      ch => ch.name === member.client.config.rulesChannel
    );
    
    if (rulesChannel) {
      welcomeEmbed.addFields({
        name: '📜 Reglas',
        value: `Por favor lee las reglas en ${rulesChannel}`
      });
    }
    
    try {
      await welcomeChannel.send({ embeds: [welcomeEmbed] });
      
      // Enviar mensaje de bienvenida por DM
      await member.send({
        content: `¡Hola ${member.user.username}! 👋\n\nBienvenido a **${member.guild.name}**. Esperamos que disfrutes tu estancia aquí.\n\nSi tienes alguna pregunta, no dudes en preguntar a los moderadores.`
      }).catch(() => {
        // Ignorar si el usuario tiene los DMs cerrados
        console.log(`No se pudo enviar DM de bienvenida a ${member.user.tag}`);
      });
    } catch (error) {
      console.error('Error enviando mensaje de bienvenida:', error);
    }
  }
};
