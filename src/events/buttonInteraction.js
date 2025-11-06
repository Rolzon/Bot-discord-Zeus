import { Events, EmbedBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton()) return;
    
    // Manejar creación de tickets
    if (interaction.customId === 'create_ticket') {
      await handleTicketCreation(interaction);
    }
    
    // Manejar cierre de tickets con botón
    if (interaction.customId === 'close_ticket') {
      await handleTicketClose(interaction);
    }
  }
};

async function handleTicketCreation(interaction) {
  const config = interaction.client.data.tickets.get(`config-${interaction.guildId}`);
  
  if (!config) {
    return interaction.reply({ content: '❌ El sistema de tickets no está configurado.', ephemeral: true });
  }
  
  // Verificar si el usuario ya tiene un ticket abierto
  const existingTicket = interaction.guild.channels.cache.find(
    ch => ch.name === `ticket-${interaction.user.username.toLowerCase()}` && ch.type === ChannelType.GuildText
  );
  
  if (existingTicket) {
    return interaction.reply({ content: `❌ Ya tienes un ticket abierto: ${existingTicket}`, ephemeral: true });
  }
  
  await interaction.deferReply({ ephemeral: true });
  
  try {
    // Crear canal de ticket
    const ticketChannel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: config.category,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory
          ]
        },
        {
          id: interaction.client.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageChannels
          ]
        }
      ]
    });
    
    // Dar permisos a roles de moderador
    const modRoles = interaction.client.config.moderatorRoles;
    for (const roleName of modRoles) {
      const role = interaction.guild.roles.cache.find(r => r.name === roleName);
      if (role) {
        await ticketChannel.permissionOverwrites.create(role, {
          ViewChannel: true,
          SendMessages: true,
          ReadMessageHistory: true
        });
      }
    }
    
    // Crear embed de bienvenida
    const embed = new EmbedBuilder()
      .setColor(interaction.client.config.embedColor)
      .setTitle('🎫 Ticket Creado')
      .setDescription(`Hola ${interaction.user}, gracias por crear un ticket.\n\n` +
        'El staff te atenderá pronto. Por favor, describe tu problema o pregunta con el mayor detalle posible.\n\n' +
        '**Para cerrar el ticket:**\n' +
        '• Usa el comando `/ticket-close`\n' +
        '• O haz clic en el botón de abajo')
      .setFooter({ text: `Ticket de ${interaction.user.tag}` })
      .setTimestamp();
    
    const closeButton = new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel('Cerrar Ticket')
      .setEmoji('🔒')
      .setStyle(ButtonStyle.Danger);
    
    const row = new ActionRowBuilder().addComponents(closeButton);
    
    await ticketChannel.send({ 
      content: `${interaction.user} | Staff: ${modRoles.map(r => `@${r}`).join(', ')}`,
      embeds: [embed],
      components: [row]
    });
    
    await interaction.editReply({ content: `✅ Ticket creado: ${ticketChannel}` });
    
  } catch (error) {
    console.error('Error creando ticket:', error);
    await interaction.editReply({ content: '❌ Error al crear el ticket.' });
  }
}

async function handleTicketClose(interaction) {
  const channel = interaction.channel;
  
  if (!channel.name.startsWith('ticket-')) {
    return interaction.reply({ content: '❌ Este botón solo funciona en canales de tickets.', ephemeral: true });
  }
  
  await interaction.reply('🔒 Cerrando ticket en 5 segundos...');
  
  try {
    // Crear transcripción
    const messages = await channel.messages.fetch({ limit: 100 });
    const transcript = messages.reverse().map(msg => 
      `[${msg.createdAt.toLocaleString()}] ${msg.author.tag}: ${msg.content}`
    ).join('\n');
    
    // Buscar canal de logs
    const logChannel = interaction.guild.channels.cache.find(
      ch => ch.name === interaction.client.config.logChannel
    );
    
    if (logChannel) {
      const { AttachmentBuilder } = await import('discord.js');
      const attachment = new AttachmentBuilder(Buffer.from(transcript, 'utf-8'), {
        name: `transcript-${channel.name}.txt`
      });
      
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🎫 Ticket Cerrado')
        .addFields(
          { name: '📝 Ticket', value: channel.name, inline: true },
          { name: '👤 Cerrado por', value: interaction.user.tag, inline: true }
        )
        .setTimestamp();
      
      await logChannel.send({ embeds: [embed], files: [attachment] });
    }
    
    setTimeout(async () => {
      await channel.delete();
    }, 5000);
    
  } catch (error) {
    console.error('Error cerrando ticket:', error);
  }
}
