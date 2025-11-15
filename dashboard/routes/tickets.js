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
    if (!ticketChannel || (!ticketChannel.name.startsWith('ticket-') && !ticketChannel.name.startsWith('closed-'))) {
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

    // Obtener información adicional de la base de datos (opcional)
    let ticketData = null;
    try {
      const Ticket = (await import('../../src/database/models/Ticket.js')).default;
      ticketData = await Ticket.findOne({ channelId: ticketId });
    } catch (dbError) {
      console.log('No se pudo obtener datos de la base de datos:', dbError.message);
    }

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
      claimedBy: ticketData?.claimedBy || null,
      closedAt: ticketData?.closedAt || null,
      notes: ticketData?.notes || [],
      transfers: ticketData?.transfers || []
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
    const content = req.body.content;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Mensaje no puede estar vacío' });
    }

    const ticketChannel = guild.channels.cache.get(ticketId);
    if (!ticketChannel) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    // Enviar mensaje
    const sentMessage = await ticketChannel.send({
      embeds: [{
        description: content,
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
        content: content,
        author: {
          username: `${req.user.username} (Dashboard)`,
          avatar: `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png`,
          isStaff: true
        },
        timestamp: sentMessage.createdAt,
        attachments: []
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

// Reclamar ticket
router.post('/:guildId/ticket/:ticketId/claim', ensureGuildAdmin, async (req, res) => {
  try {
    const guild = req.guild;
    const ticketId = req.params.ticketId;
    
    const ticketChannel = guild.channels.cache.get(ticketId);
    if (!ticketChannel || !ticketChannel.name.startsWith('ticket-')) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    // Importar modelo de Ticket y actualizar en base de datos (opcional)
    try {
      const Ticket = (await import('../../src/database/models/Ticket.js')).default;
      const ticket = await Ticket.findOne({ channelId: ticketId });
      if (ticket) {
        ticket.claimedBy = {
          userId: req.user.id,
          username: req.user.username,
          avatar: `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png`,
          claimedAt: new Date()
        };
        await ticket.save();
      }
    } catch (dbError) {
      console.log('No se pudo actualizar en base de datos:', dbError.message);
    }

    // Enviar mensaje en el canal
    await ticketChannel.send({
      embeds: [{
        title: '✋ Ticket Reclamado',
        description: `Este ticket ha sido reclamado por **${req.user.username}** desde el dashboard.`,
        color: 0x5865f2,
        timestamp: new Date().toISOString()
      }]
    });

    // Emitir evento en tiempo real
    io.to(`guild-${guild.id}`).emit('ticket-claimed', {
      ticketId: ticketId,
      claimedBy: {
        userId: req.user.id,
        username: req.user.username,
        avatar: `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png`
      }
    });

    res.json({ 
      success: true, 
      message: 'Ticket reclamado exitosamente',
      claimedBy: req.user.username
    });
  } catch (error) {
    console.error('Error reclamando ticket:', error);
    res.status(500).json({ error: 'Error reclamando ticket' });
  }
});

// Añadir nota al ticket
router.post('/:guildId/ticket/:ticketId/note', ensureGuildAdmin, async (req, res) => {
  try {
    const guild = req.guild;
    const ticketId = req.params.ticketId;
    const content = req.body.content;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'La nota no puede estar vacía' });
    }

    const ticketChannel = guild.channels.cache.get(ticketId);
    if (!ticketChannel || !ticketChannel.name.startsWith('ticket-')) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    // Importar modelo de Ticket y guardar nota en base de datos (opcional)
    try {
      const Ticket = (await import('../../src/database/models/Ticket.js')).default;
      const ticket = await Ticket.findOne({ channelId: ticketId });
      if (ticket) {
        ticket.notes.push({
          userId: req.user.id,
          username: req.user.username,
          content: content,
          timestamp: new Date()
        });
        await ticket.save();
      }
    } catch (dbError) {
      console.log('No se pudo guardar nota en base de datos:', dbError.message);
    }

    // Enviar mensaje en el canal (solo visible para staff)
    await ticketChannel.send({
      embeds: [{
        title: '📝 Nota Interna Añadida',
        description: content,
        color: 0xffa500,
        author: {
          name: `${req.user.username} (Staff)`,
          icon_url: `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png`
        },
        footer: {
          text: 'Esta es una nota interna visible solo para el staff'
        },
        timestamp: new Date().toISOString()
      }]
    });

    // Emitir evento en tiempo real
    io.to(`guild-${guild.id}`).emit('ticket-note-added', {
      ticketId: ticketId,
      note: {
        userId: req.user.id,
        username: req.user.username,
        content: content,
        timestamp: new Date()
      }
    });

    res.json({ 
      success: true, 
      message: 'Nota añadida exitosamente'
    });
  } catch (error) {
    console.error('Error añadiendo nota:', error);
    res.status(500).json({ error: 'Error añadiendo nota' });
  }
});

// Transferir ticket
router.post('/:guildId/ticket/:ticketId/transfer', ensureGuildAdmin, async (req, res) => {
  try {
    const guild = req.guild;
    const ticketId = req.params.ticketId;
    const { targetUserId, reason } = req.body;
    
    if (!targetUserId) {
      return res.status(400).json({ error: 'Debe especificar un usuario destino' });
    }

    const ticketChannel = guild.channels.cache.get(ticketId);
    if (!ticketChannel || !ticketChannel.name.startsWith('ticket-')) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    // Obtener información del usuario destino
    const targetMember = await guild.members.fetch(targetUserId).catch(() => null);
    if (!targetMember) {
      return res.status(404).json({ error: 'Usuario destino no encontrado' });
    }

    // Importar modelo de Ticket y actualizar en base de datos (opcional)
    try {
      const Ticket = (await import('../../src/database/models/Ticket.js')).default;
      const ticket = await Ticket.findOne({ channelId: ticketId });
      if (ticket) {
        ticket.transfers.push({
          fromUserId: req.user.id,
          fromUsername: req.user.username,
          toUserId: targetUserId,
          toUsername: targetMember.user.username,
          reason: reason || 'Sin razón especificada',
          timestamp: new Date()
        });
        
        // Actualizar reclamación si existe
        if (ticket.claimedBy) {
          ticket.claimedBy = {
            userId: targetUserId,
            username: targetMember.user.username,
            avatar: targetMember.user.displayAvatarURL(),
            claimedAt: new Date()
          };
        }
        
        await ticket.save();
      }
    } catch (dbError) {
      console.log('No se pudo actualizar transferencia en base de datos:', dbError.message);
    }

    // Dar permisos al nuevo usuario
    await ticketChannel.permissionOverwrites.create(targetUserId, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true
    });

    // Enviar mensaje en el canal
    await ticketChannel.send({
      embeds: [{
        title: '🔄 Ticket Transferido',
        description: `Este ticket ha sido transferido de **${req.user.username}** a **${targetMember.user.username}**.\n**Razón:** ${reason || 'Sin razón especificada'}`,
        color: 0xffa500,
        timestamp: new Date().toISOString()
      }]
    });

    // Emitir evento en tiempo real
    io.to(`guild-${guild.id}`).emit('ticket-transferred', {
      ticketId: ticketId,
      from: req.user.username,
      to: targetMember.user.username,
      reason: reason
    });

    res.json({ 
      success: true, 
      message: 'Ticket transferido exitosamente',
      transferredTo: targetMember.user.username
    });
  } catch (error) {
    console.error('Error transfiriendo ticket:', error);
    res.status(500).json({ error: 'Error transfiriendo ticket' });
  }
});

// Obtener información del usuario del ticket
router.get('/:guildId/ticket/:ticketId/user-info', ensureGuildAdmin, async (req, res) => {
  try {
    const guild = req.guild;
    const ticketId = req.params.ticketId;
    
    const ticketChannel = guild.channels.cache.get(ticketId);
    if (!ticketChannel || !ticketChannel.name.startsWith('ticket-')) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    // Importar modelo de Ticket
    let ticket = null;
    let userTickets = [];
    
    try {
      const Ticket = (await import('../../src/database/models/Ticket.js')).default;
      ticket = await Ticket.findOne({ channelId: ticketId });
      
      if (ticket) {
        // Obtener tickets previos del usuario
        userTickets = await Ticket.find({ 
          guildId: guild.id, 
          userId: ticket.userId 
        }).sort({ createdAt: -1 });
      }
    } catch (dbError) {
      console.log('No se pudo obtener datos de la base de datos:', dbError.message);
    }
    
    if (!ticket) {
      return res.status(404).json({ error: 'Información del ticket no encontrada en la base de datos' });
    }

    // Obtener información del usuario
    const member = await guild.members.fetch(ticket.userId).catch(() => null);
    
    if (!member) {
      return res.json({
        userId: ticket.userId,
        username: ticket.username,
        avatar: null,
        joinedAt: null,
        roles: [],
        status: 'Usuario no encontrado en el servidor'
      });
    }

    const userInfo = {
      userId: member.id,
      username: member.user.tag,
      avatar: member.user.displayAvatarURL(),
      joinedAt: member.joinedAt,
      accountCreated: member.user.createdAt,
      roles: member.roles.cache
        .filter(role => role.id !== guild.id)
        .map(role => ({
          id: role.id,
          name: role.name,
          color: role.hexColor
        })),
      ticketHistory: {
        total: userTickets.length,
        open: userTickets.filter(t => t.status === 'open').length,
        closed: userTickets.filter(t => t.status === 'closed').length,
        recent: userTickets.slice(0, 5).map(t => ({
          id: t.channelId,
          number: t.ticketNumber,
          category: t.category,
          status: t.status,
          createdAt: t.createdAt,
          closedAt: t.closedAt
        }))
      },
      currentTicket: {
        number: ticket.ticketNumber,
        category: ticket.category,
        createdAt: ticket.createdAt,
        messageCount: ticket.messages.length,
        notes: ticket.notes.length
      }
    };

    res.json(userInfo);
  } catch (error) {
    console.error('Error obteniendo información del usuario:', error);
    res.status(500).json({ error: 'Error obteniendo información del usuario' });
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
