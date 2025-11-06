import { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ticket-close')
    .setDescription('Cierra el ticket actual')
    .addStringOption(option =>
      option.setName('razon')
        .setDescription('Razón del cierre')
        .setRequired(false)),
  
  async execute(interaction) {
    const channel = interaction.channel;
    
    // Verificar si es un ticket
    if (!channel.name.startsWith('ticket-')) {
      return interaction.reply({ content: '❌ Este comando solo puede usarse en canales de tickets.', ephemeral: true });
    }
    
    const reason = interaction.options.getString('razon') || 'No se especificó razón';
    
    await interaction.reply('🔒 Cerrando ticket...');
    
    try {
      // Crear transcripción
      const messages = await channel.messages.fetch({ limit: 100 });
      const transcript = messages.reverse().map(msg => 
        `[${msg.createdAt.toLocaleString()}] ${msg.author.tag}: ${msg.content}`
      ).join('\n');
      
      const attachment = new AttachmentBuilder(Buffer.from(transcript, 'utf-8'), {
        name: `transcript-${channel.name}.txt`
      });
      
      // Buscar canal de logs
      const logChannel = interaction.guild.channels.cache.find(
        ch => ch.name === interaction.client.config.logChannel
      );
      
      if (logChannel) {
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('🎫 Ticket Cerrado')
          .addFields(
            { name: '📝 Ticket', value: channel.name, inline: true },
            { name: '👤 Cerrado por', value: interaction.user.tag, inline: true },
            { name: '📋 Razón', value: reason }
          )
          .setTimestamp();
        
        await logChannel.send({ embeds: [embed], files: [attachment] });
      }
      
      // Eliminar canal después de 5 segundos
      setTimeout(async () => {
        await channel.delete();
      }, 5000);
      
    } catch (error) {
      console.error('Error cerrando ticket:', error);
      await interaction.followUp({ content: '❌ Error al cerrar el ticket.', ephemeral: true });
    }
  }
};
