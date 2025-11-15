import express from 'express';
import { dashboardClient, io } from '../server.js';

const router = express.Router();

// Middleware para verificar permisos de administrador en el servidor
async function ensureGuildAdmin(req, res, next) {
  const guildId = req.params.guildId;
  
  try {
    const guild = await dashboardClient.guilds.fetch(guildId);
    const member = await guild.members.fetch(req.user.id);
    
    if (member.permissions.has('Administrator') || member.permissions.has('ManageChannels')) {
      req.guild = guild;
      req.member = member;
      return next();
    }
    
    return res.status(403).json({ error: 'No tienes permisos suficientes' });
  } catch (error) {
    return res.status(404).json({ error: 'Servidor no encontrado' });
  }
}

// Dashboard principal de tickets
router.get('/:guildId', ensureGuildAdmin, async (req, res) => {
  try {
    const guild = req.guild;
    
    // Obtener todos los canales de tickets (canales que empiecen con "ticket-")
    const ticketChannels = guild.channels.cache.filter(channel => 
      channel.name.startsWith('ticket-') && channel.type === 0
    );

    // Clasificar tickets por estado
    const tickets = {
      open: [],
      closed: [],
      total: ticketChannels.size
    };

    for (const [channelId, channel] of ticketChannels) {
      const ticketInfo = {
        id: channelId,
        name: channel.name,
        createdAt: channel.createdAt,
        memberCount: channel.members.size,
        lastMessage: null,
        status: 'open',
        category: channel.parent?.name || 'Sin categoría',
        creator: null
      };

      // Obtener último mensaje
      try {
        const messages = await channel.messages.fetch({ limit: 1 });
        if (messages.size > 0) {
          const lastMsg = messages.first();
          ticketInfo.lastMessage = {
            content: lastMsg.content.substring(0, 100) + (lastMsg.content.length > 100 ? '...' : ''),
            author: lastMsg.author.tag,
            timestamp: lastMsg.createdAt
          };
        }
      } catch (error) {
        console.log('No se pudo obtener mensajes del canal:', channel.name);
      }

      // Determinar si está cerrado (sin miembros activos o archivado)
      if (channel.members.size <= 1) {
        ticketInfo.status = 'inactive';
        tickets.closed.push(ticketInfo);
      } else {
        tickets.open.push(ticketInfo);
      }
    }

    // Estadísticas
    const stats = {
      totalTickets: tickets.total,
      openTickets: tickets.open.length,
      closedTickets: tickets.closed.length,
      avgResponseTime: '2.5 horas', // Placeholder
      todayTickets: tickets.open.filter(t => 
        new Date(t.createdAt).toDateString() === new Date().toDateString()
      ).length
    };

    res.render('tickets/dashboard', {
      user: req.user,
      guild: guild,
      tickets: tickets,
      stats: stats
    });
  } catch (error) {
    console.error('Error en dashboard de tickets:', error);
    res.render('error', { 
      error: 'Error cargando dashboard de tickets',
      user: req.user 
    });
  }
});

// Ver ticket específico
router.get('/:guildId/ticket/:ticketId', ensureGuildAdmin, async (req, res) => {
  try {
    const guild = req.guild;
    const ticketId = req.params.ticketId;
    
    const ticketChannel = guild.channels.cache.get(ticketId);
    if (!ticketChannel || !ticketChannel.name.startsWith('ticket-')) {
      return res.status(404).render('error', { 
        error: 'Ticket no encontrado',
        user: req.user 
      });
    }

    // Obtener mensajes del ticket
    const messages = await ticketChannel.messages.fetch({ limit: 100 });
    const messageHistory = Array.from(messages.values())
      .reverse()
      .map(msg => ({
        id: msg.id,
        content: msg.content,
        author: {
          tag: msg.author.tag,
          avatar: msg.author.displayAvatarURL(),
          bot: msg.author.bot
        },
        timestamp: msg.createdAt,
        attachments: msg.attachments.map(att => ({
          name: att.name,
          url: att.url,
          size: att.size
        })),
        embeds: msg.embeds.length > 0
      }));

    // Información del ticket adaptada a lo que espera la vista
    const creatorMessage = messageHistory.find(m => !m.author.bot) || messageHistory[0];
    const ticketInfo = {
      id: ticketChannel.id,
      name: ticketChannel.name,
      topic: ticketChannel.topic,
      createdAt: ticketChannel.createdAt,
      category: ticketChannel.parent?.name || 'Sin categoría',
      status: ticketChannel.name.startsWith('closed-') ? 'closed' : 'open',
      creator: creatorMessage
        ? {
            username: creatorMessage.author.tag,
            avatar: creatorMessage.author.avatar
          }
        : {
            username: 'Desconocido',
            avatar: guild.iconURL()
          },
      messages: messageHistory.map(m => ({
        id: m.id,
        content: m.content,
        author: {
          username: m.author.tag,
          avatar: m.author.avatar,
          isStaff: m.author.bot
        },
        timestamp: m.timestamp,
        attachments: m.attachments
      })),
      participants: Array.from(ticketChannel.members.values()).map(member => ({
        id: member.id,
        username: member.user.tag,
        avatar: member.user.displayAvatarURL(),
        joinedAt: member.joinedAt
      })),
      claimedBy: null,
      closedAt: null
    };

    res.render('tickets/view', {
      user: req.user,
      guild: guild,
      ticket: ticketInfo
    });
  } catch (error) {
    console.error('Error viendo ticket:', error);
    res.render('error', { 
      error: 'Error cargando ticket',
      user: req.user 
    });
  }
});

// Cerrar ticket
router.post('/:guildId/ticket/:ticketId/close', ensureGuildAdmin, async (req, res) => {
  try {
    const guild = req.guild;
    const ticketId = req.params.ticketId;
    const reason = req.body.reason || 'Cerrado por administrador';
    
    const ticketChannel = guild.channels.cache.get(ticketId);
    if (!ticketChannel || !ticketChannel.name.startsWith('ticket-')) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    // Crear transcripción antes de cerrar
    const messages = await ticketChannel.messages.fetch({ limit: 100 });
    const transcript = Array.from(messages.values())
      .reverse()
      .map(msg => `[${msg.createdAt.toISOString()}] ${msg.author.tag}: ${msg.content}`)
      .join('\n');

    // Enviar mensaje de cierre
    await ticketChannel.send({
      embeds: [{
        title: '🔒 Ticket Cerrado',
        description: `Este ticket ha sido cerrado por ${req.user.username}.\n**Razón:** ${reason}`,
        color: 0xff0000,
        timestamp: new Date().toISOString()
      }]
    });

    // Archivar el canal (cambiar permisos para que solo staff pueda ver)
    await ticketChannel.permissionOverwrites.edit(guild.roles.everyone, {
      ViewChannel: false,
      SendMessages: false
    });

    // Cambiar nombre para indicar que está cerrado
    await ticketChannel.setName(`closed-${ticketChannel.name.replace('ticket-', '')}`);

    // Emitir evento en tiempo real
    io.to(`guild-${guild.id}`).emit('ticket-closed', {
      ticketId: ticketId,
      closedBy: req.user.username,
      reason: reason
    });

    res.json({ 
      success: true, 
      message: 'Ticket cerrado exitosamente',
      transcript: transcript.length 
    });
  } catch (error) {
    console.error('Error cerrando ticket:', error);
    res.status(500).json({ error: 'Error cerrando ticket' });
  }
});

// Reabrir ticket
router.post('/:guildId/ticket/:ticketId/reopen', ensureGuildAdmin, async (req, res) => {
  try {
    const guild = req.guild;
    const ticketId = req.params.ticketId;
    
    const ticketChannel = guild.channels.cache.get(ticketId);
    if (!ticketChannel) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    // Restaurar permisos
    await ticketChannel.permissionOverwrites.edit(guild.roles.everyone, {
      ViewChannel: false,
      SendMessages: null
    });

    // Cambiar nombre de vuelta
    const newName = ticketChannel.name.replace('closed-', 'ticket-');
    await ticketChannel.setName(newName);

    // Enviar mensaje de reapertura
    await ticketChannel.send({
      embeds: [{
        title: '🔓 Ticket Reabierto',
        description: `Este ticket ha sido reabierto por ${req.user.username}.`,
        color: 0x00ff00,
        timestamp: new Date().toISOString()
      }]
    });

    // Emitir evento en tiempo real
    io.to(`guild-${guild.id}`).emit('ticket-reopened', {
      ticketId: ticketId,
      reopenedBy: req.user.username
    });

    res.json({ 
      success: true, 
      message: 'Ticket reabierto exitosamente' 
    });
  } catch (error) {
    console.error('Error reabriendo ticket:', error);
    res.status(500).json({ error: 'Error reabriendo ticket' });
  }
});

// Eliminar ticket permanentemente
router.delete('/:guildId/ticket/:ticketId', ensureGuildAdmin, async (req, res) => {
  try {
    const guild = req.guild;
    const ticketId = req.params.ticketId;
    
    const ticketChannel = guild.channels.cache.get(ticketId);
    if (!ticketChannel) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    const ticketName = ticketChannel.name;
    
    // Eliminar canal
    await ticketChannel.delete('Eliminado desde el dashboard');

    // Emitir evento en tiempo real
    io.to(`guild-${guild.id}`).emit('ticket-deleted', {
      ticketId: ticketId,
      ticketName: ticketName,
      deletedBy: req.user.username
    });

    res.json({ 
      success: true, 
      message: 'Ticket eliminado permanentemente' 
    });
  } catch (error) {
    console.error('Error eliminando ticket:', error);
    res.status(500).json({ error: 'Error eliminando ticket' });
  }
});

// Enviar mensaje al ticket desde el dashboard
router.post('/:guildId/ticket/:ticketId/message', ensureGuildAdmin, async (req, res) => {
  try {
    const guild = req.guild;
    const ticketId = req.params.ticketId;
    const message = req.body.message;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Mensaje no puede estar vacío' });
    }

    const ticketChannel = guild.channels.cache.get(ticketId);
    if (!ticketChannel) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    // Enviar mensaje
    const sentMessage = await ticketChannel.send({
      embeds: [{
        description: message,
        color: 0x5865f2,
        author: {
          name: `${req.user.username} (Dashboard)`,
          icon_url: `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png`
        },
        timestamp: new Date().toISOString()
      }]
    });

    // Emitir evento en tiempo real
    io.to(`guild-${guild.id}`).emit('ticket-message', {
      ticketId: ticketId,
      message: {
        id: sentMessage.id,
        content: message,
        author: req.user.username,
        timestamp: sentMessage.createdAt
      }
    });

    res.json({ 
      success: true, 
      message: 'Mensaje enviado exitosamente',
      messageId: sentMessage.id
    });
  } catch (error) {
    console.error('Error enviando mensaje:', error);
    res.status(500).json({ error: 'Error enviando mensaje' });
  }
});

// Estadísticas de tickets
router.get('/:guildId/stats', ensureGuildAdmin, async (req, res) => {
  try {
    const guild = req.guild;
    
    // Obtener todos los canales de tickets
    const allTicketChannels = guild.channels.cache.filter(channel => 
      channel.name.includes('ticket-') || channel.name.includes('closed-')
    );

    // Calcular estadísticas
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = {
      total: allTicketChannels.size,
      today: allTicketChannels.filter(c => c.createdAt >= today).size,
      thisWeek: allTicketChannels.filter(c => c.createdAt >= thisWeek).size,
      thisMonth: allTicketChannels.filter(c => c.createdAt >= thisMonth).size,
      open: allTicketChannels.filter(c => c.name.startsWith('ticket-')).size,
      closed: allTicketChannels.filter(c => c.name.startsWith('closed-')).size
    };

    res.json(stats);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
});

export default router;
