import express from 'express';
import { dashboardClient, io } from '../server.js';

const router = express.Router();

// Middleware para verificar permisos de administrador
async function ensureGuildAdmin(req, res, next) {
  const guildId = req.params.guildId || req.body.guildId;
  
  try {
    const guild = await dashboardClient.guilds.fetch(guildId);
    const member = await guild.members.fetch(req.user.id);
    
    if (member.permissions.has('Administrator') || member.permissions.has('ManageGuild')) {
      req.guild = guild;
      req.member = member;
      return next();
    }
    
    return res.status(403).json({ error: 'No tienes permisos suficientes' });
  } catch (error) {
    return res.status(404).json({ error: 'Servidor no encontrado' });
  }
}

// Obtener información básica del servidor
router.get('/guild/:guildId/info', ensureGuildAdmin, async (req, res) => {
  try {
    const guild = req.guild;
    
    const guildInfo = {
      id: guild.id,
      name: guild.name,
      icon: guild.iconURL({ size: 256 }),
      memberCount: guild.memberCount,
      createdAt: guild.createdAt,
      owner: await guild.fetchOwner(),
      boostLevel: guild.premiumTier,
      boostCount: guild.premiumSubscriptionCount,
      features: guild.features,
      channels: {
        total: guild.channels.cache.size,
        text: guild.channels.cache.filter(c => c.type === 0).size,
        voice: guild.channels.cache.filter(c => c.type === 2).size,
        category: guild.channels.cache.filter(c => c.type === 4).size
      },
      roles: guild.roles.cache.size,
      emojis: guild.emojis.cache.size
    };

    res.json(guildInfo);
  } catch (error) {
    console.error('Error obteniendo info del servidor:', error);
    res.status(500).json({ error: 'Error obteniendo información del servidor' });
  }
});

// Obtener miembros del servidor
router.get('/guild/:guildId/members', ensureGuildAdmin, async (req, res) => {
  try {
    const guild = req.guild;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search || '';

    await guild.members.fetch();
    let members = Array.from(guild.members.cache.values());

    // Filtrar por búsqueda si se proporciona
    if (search) {
      members = members.filter(member => 
        member.user.tag.toLowerCase().includes(search.toLowerCase()) ||
        member.displayName.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Paginación
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMembers = members.slice(startIndex, endIndex);

    const memberData = paginatedMembers.map(member => ({
      id: member.id,
      tag: member.user.tag,
      displayName: member.displayName,
      avatar: member.user.displayAvatarURL({ size: 64 }),
      joinedAt: member.joinedAt,
      roles: member.roles.cache.map(role => ({
        id: role.id,
        name: role.name,
        color: role.hexColor
      })),
      isBot: member.user.bot,
      status: member.presence?.status || 'offline'
    }));

    res.json({
      members: memberData,
      pagination: {
        page: page,
        limit: limit,
        total: members.length,
        pages: Math.ceil(members.length / limit)
      }
    });
  } catch (error) {
    console.error('Error obteniendo miembros:', error);
    res.status(500).json({ error: 'Error obteniendo miembros' });
  }
});

// Obtener canales del servidor
router.get('/guild/:guildId/channels', ensureGuildAdmin, async (req, res) => {
  try {
    const guild = req.guild;
    
    const channels = Array.from(guild.channels.cache.values()).map(channel => ({
      id: channel.id,
      name: channel.name,
      type: channel.type,
      position: channel.position,
      parent: channel.parent ? {
        id: channel.parent.id,
        name: channel.parent.name
      } : null,
      topic: channel.topic || null,
      nsfw: channel.nsfw || false,
      userLimit: channel.userLimit || null,
      bitrate: channel.bitrate || null,
      createdAt: channel.createdAt
    }));

    res.json(channels);
  } catch (error) {
    console.error('Error obteniendo canales:', error);
    res.status(500).json({ error: 'Error obteniendo canales' });
  }
});

// Obtener roles del servidor
router.get('/guild/:guildId/roles', ensureGuildAdmin, async (req, res) => {
  try {
    const guild = req.guild;
    
    const roles = Array.from(guild.roles.cache.values())
      .sort((a, b) => b.position - a.position)
      .map(role => ({
        id: role.id,
        name: role.name,
        color: role.hexColor,
        position: role.position,
        permissions: role.permissions.toArray(),
        mentionable: role.mentionable,
        hoisted: role.hoist,
        managed: role.managed,
        memberCount: role.members.size,
        createdAt: role.createdAt
      }));

    res.json(roles);
  } catch (error) {
    console.error('Error obteniendo roles:', error);
    res.status(500).json({ error: 'Error obteniendo roles' });
  }
});

// Ejecutar comando de moderación
router.post('/guild/:guildId/moderation/:action', ensureGuildAdmin, async (req, res) => {
  try {
    const guild = req.guild;
    const action = req.params.action;
    const { userId, reason, duration } = req.body;

    const targetMember = await guild.members.fetch(userId);
    if (!targetMember) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar jerarquía de roles
    if (targetMember.roles.highest.position >= req.member.roles.highest.position) {
      return res.status(403).json({ error: 'No puedes moderar a este usuario (jerarquía de roles)' });
    }

    let result = {};

    switch (action) {
      case 'kick':
        await targetMember.kick(reason);
        result = { action: 'kick', user: targetMember.user.tag, reason };
        break;

      case 'ban':
        await targetMember.ban({ reason });
        result = { action: 'ban', user: targetMember.user.tag, reason };
        break;

      case 'timeout':
        const timeoutDuration = duration ? parseInt(duration) * 60 * 1000 : 10 * 60 * 1000; // Default 10 min
        await targetMember.timeout(timeoutDuration, reason);
        result = { action: 'timeout', user: targetMember.user.tag, duration: timeoutDuration, reason };
        break;

      case 'untimeout':
        await targetMember.timeout(null, reason);
        result = { action: 'untimeout', user: targetMember.user.tag, reason };
        break;

      default:
        return res.status(400).json({ error: 'Acción no válida' });
    }

    // Emitir evento en tiempo real
    io.to(`guild-${guild.id}`).emit('moderation-action', {
      ...result,
      moderator: req.user.username,
      timestamp: new Date()
    });

    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error en acción de moderación:', error);
    res.status(500).json({ error: 'Error ejecutando acción de moderación' });
  }
});

// Gestionar roles de usuario
router.post('/guild/:guildId/member/:userId/roles', ensureGuildAdmin, async (req, res) => {
  try {
    const guild = req.guild;
    const userId = req.params.userId;
    const { roleId, action } = req.body; // action: 'add' o 'remove'

    const targetMember = await guild.members.fetch(userId);
    const role = guild.roles.cache.get(roleId);

    if (!targetMember || !role) {
      return res.status(404).json({ error: 'Usuario o rol no encontrado' });
    }

    // Verificar jerarquía de roles
    if (role.position >= req.member.roles.highest.position) {
      return res.status(403).json({ error: 'No puedes gestionar este rol (jerarquía)' });
    }

    if (action === 'add') {
      await targetMember.roles.add(role);
    } else if (action === 'remove') {
      await targetMember.roles.remove(role);
    } else {
      return res.status(400).json({ error: 'Acción no válida' });
    }

    res.json({ 
      success: true, 
      action: action,
      user: targetMember.user.tag,
      role: role.name 
    });
  } catch (error) {
    console.error('Error gestionando roles:', error);
    res.status(500).json({ error: 'Error gestionando roles' });
  }
});

// Limpiar mensajes de un canal
router.post('/guild/:guildId/channel/:channelId/clear', ensureGuildAdmin, async (req, res) => {
  try {
    const guild = req.guild;
    const channelId = req.params.channelId;
    const { amount } = req.body;

    const channel = guild.channels.cache.get(channelId);
    if (!channel || channel.type !== 0) {
      return res.status(404).json({ error: 'Canal de texto no encontrado' });
    }

    const deleteAmount = Math.min(parseInt(amount) || 10, 100);
    const messages = await channel.messages.fetch({ limit: deleteAmount });
    await channel.bulkDelete(messages);

    res.json({ 
      success: true, 
      deleted: messages.size,
      channel: channel.name 
    });
  } catch (error) {
    console.error('Error limpiando mensajes:', error);
    res.status(500).json({ error: 'Error limpiando mensajes' });
  }
});

// Obtener estadísticas del bot en el servidor
router.get('/guild/:guildId/bot-stats', ensureGuildAdmin, async (req, res) => {
  try {
    const guild = req.guild;
    
    // Estadísticas básicas
    const stats = {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      guildCount: dashboardClient.guilds.cache.size,
      userCount: dashboardClient.users.cache.size,
      channelCount: dashboardClient.channels.cache.size,
      commandsUsed: 0, // Se conectaría con un sistema de tracking
      messagesProcessed: 0, // Se conectaría con un sistema de tracking
      musicQueues: 0, // Se conectaría con discord-player
      activeTickets: guild.channels.cache.filter(c => c.name.startsWith('ticket-')).size,
      tempVoiceChannels: guild.channels.cache.filter(c => c.name.includes('\ud83d\udd0a')).size
    };

    res.json(stats);
  } catch (error) {
    console.error('Error obteniendo estadísticas del bot:', error);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
});

// ==============================
//  Configuración de ChatGPT por servidor
// ==============================

// Nota: por ahora esta configuración se mantiene solo en memoria a nivel de proceso.
// En producción real se debería usar una base de datos compartida con el bot.
const guildGPTConfig = new Map(); // guildId => { ignoreRoleId, pendingTimeoutMinutes }

const defaultGPTConfig = {
  ignoreRoleId: process.env.CHATGPT_IGNORE_ROLE_ID || null,
  pendingTimeoutMinutes: parseInt(process.env.CHATGPT_PENDING_TIMEOUT_MINUTES) || 5
};

// Obtener configuración de ChatGPT para un servidor
router.get('/guild/:guildId/gpt-config', ensureGuildAdmin, async (req, res) => {
  try {
    const guildId = req.params.guildId;
    const config = guildGPTConfig.get(guildId) || defaultGPTConfig;
    res.json({
      ignoreRoleId: config.ignoreRoleId || null,
      pendingTimeoutMinutes: config.pendingTimeoutMinutes || defaultGPTConfig.pendingTimeoutMinutes
    });
  } catch (error) {
    console.error('Error obteniendo configuración de GPT:', error);
    res.status(500).json({ error: 'Error obteniendo configuración de GPT' });
  }
});

// Guardar configuración de ChatGPT para un servidor
router.post('/guild/:guildId/gpt-config', ensureGuildAdmin, async (req, res) => {
  try {
    const guildId = req.params.guildId;
    const { ignoreRoleId, pendingTimeoutMinutes } = req.body;

    const timeout = parseInt(pendingTimeoutMinutes);

    guildGPTConfig.set(guildId, {
      ignoreRoleId: ignoreRoleId || null,
      pendingTimeoutMinutes: Number.isNaN(timeout) ? defaultGPTConfig.pendingTimeoutMinutes : Math.max(1, timeout)
    });

    res.json({
      success: true,
      config: guildGPTConfig.get(guildId)
    });
  } catch (error) {
    console.error('Error guardando configuración de GPT:', error);
    res.status(500).json({ error: 'Error guardando configuración de GPT' });
  }
});

// Leaderboard básico de niveles (datos simulados por ahora)
router.get('/guild/:guildId/levels/leaderboard', ensureGuildAdmin, async (req, res) => {
  try {
    const guild = req.guild;

    // Cargar miembros del servidor
    await guild.members.fetch();
    const members = Array.from(guild.members.cache.values())
      .filter(m => !m.user.bot);

    // Por ahora generamos datos básicos sin leer la base de datos real de niveles
    const leaderboard = members.slice(0, 50).map(member => ({
      userId: member.id,
      username: member.displayName || member.user.tag,
      avatar: member.user.displayAvatarURL({ size: 64 }),
      level: 0,
      xp: 0,
      messageCount: 0
    }));

    const stats = {
      totalUsers: leaderboard.length,
      avgLevel: leaderboard.length ? 0 : 0,
      totalXP: 0,
      maxLevel: 0
    };

    res.json({ leaderboard, stats });
  } catch (error) {
    console.error('Error obteniendo leaderboard de niveles:', error);
    res.status(500).json({ error: 'Error obteniendo datos de niveles' });
  }
});

// Enviar mensaje a un canal
router.post('/guild/:guildId/channel/:channelId/message', ensureGuildAdmin, async (req, res) => {
  try {
    const guild = req.guild;
    const channelId = req.params.channelId;
    const { content, embed } = req.body;

    const channel = guild.channels.cache.get(channelId);
    if (!channel || channel.type !== 0) {
      return res.status(404).json({ error: 'Canal de texto no encontrado' });
    }

    const messageOptions = {};
    
    if (content) {
      messageOptions.content = content;
    }
    
    if (embed) {
      messageOptions.embeds = [{
        title: embed.title,
        description: embed.description,
        color: parseInt(embed.color) || 0x5865f2,
        footer: {
          text: `Enviado desde el dashboard por ${req.user.username}`
        },
        timestamp: new Date().toISOString()
      }];
    }

    const sentMessage = await channel.send(messageOptions);

    res.json({ 
      success: true, 
      messageId: sentMessage.id,
      channel: channel.name 
    });
  } catch (error) {
    console.error('Error enviando mensaje:', error);
    res.status(500).json({ error: 'Error enviando mensaje' });
  }
});

// Obtener logs recientes del servidor
router.get('/guild/:guildId/logs', ensureGuildAdmin, async (req, res) => {
  try {
    const guild = req.guild;
    const limit = parseInt(req.query.limit) || 50;
    
    // Aquí se conectaría con MongoDB para obtener logs reales
    // Por ahora devolvemos datos de ejemplo
    const logs = [
      {
        id: '1',
        type: 'member_join',
        user: 'Usuario#1234',
        timestamp: new Date(),
        details: 'Se unió al servidor'
      },
      {
        id: '2',
        type: 'message_delete',
        user: 'Moderador#5678',
        timestamp: new Date(Date.now() - 60000),
        details: 'Eliminó un mensaje en #general'
      }
    ].slice(0, limit);

    res.json(logs);
  } catch (error) {
    console.error('Error obteniendo logs:', error);
    res.status(500).json({ error: 'Error obteniendo logs' });
  }
});

// =====================
//  Gestionar sorteos
// =====================

// Nota: por ahora estos datos se mantienen solo en memoria a nivel de proceso.
// En producción real se debería usar una base de datos.
const guildGiveawaysCache = new Map(); // guildId => { giveaways: [], stats: { ... } }

// Listar sorteos
router.get('/guild/:guildId/giveaways', ensureGuildAdmin, async (req, res) => {
  try {
    const guildId = req.params.guildId;

    if (!guildGiveawaysCache.has(guildId)) {
      guildGiveawaysCache.set(guildId, {
        giveaways: [],
        stats: { active: 0, completed: 0, participants: 0 }
      });
    }

    const data = guildGiveawaysCache.get(guildId);

    res.json({
      giveaways: data.giveaways,
      active: data.stats.active,
      completed: data.stats.completed,
      participants: data.stats.participants
    });
  } catch (error) {
    console.error('Error obteniendo sorteos:', error);
    res.status(500).json({ error: 'Error obteniendo sorteos' });
  }
});

// Crear sorteo (simulado)
router.post('/guild/:guildId/giveaways/create', ensureGuildAdmin, async (req, res) => {
  try {
    const guildId = req.params.guildId;
    const { prize, duration, winners } = req.body;

    if (!prize) {
      return res.status(400).json({ error: 'El premio es obligatorio' });
    }

    const durationMs = (parseInt(duration) || 60) * 60 * 1000;
    const endsAt = new Date(Date.now() + durationMs);

    if (!guildGiveawaysCache.has(guildId)) {
      guildGiveawaysCache.set(guildId, {
        giveaways: [],
        stats: { active: 0, completed: 0, participants: 0 }
      });
    }

    const data = guildGiveawaysCache.get(guildId);

    const giveaway = {
      id: Date.now().toString(),
      prize,
      winners: parseInt(winners) || 1,
      endsAt,
      participants: 0,
      active: true
    };

    data.giveaways.push(giveaway);
    data.stats.active = data.giveaways.filter(g => g.active).length;

    res.json({ success: true, giveaway });
  } catch (error) {
    console.error('Error creando sorteo:', error);
    res.status(500).json({ error: 'Error creando sorteo' });
  }
});

// Finalizar sorteo (simulado)
router.post('/guild/:guildId/giveaways/:id/end', ensureGuildAdmin, async (req, res) => {
  try {
    const guildId = req.params.guildId;
    const { id } = req.params;

    if (!guildGiveawaysCache.has(guildId)) {
      return res.status(404).json({ error: 'No hay sorteos para este servidor' });
    }

    const data = guildGiveawaysCache.get(guildId);
    const giveaway = data.giveaways.find(g => g.id === id);

    if (!giveaway) {
      return res.status(404).json({ error: 'Sorteo no encontrado' });
    }

    giveaway.active = false;
    data.stats.active = data.giveaways.filter(g => g.active).length;
    data.stats.completed = data.giveaways.filter(g => !g.active).length;

    // Aquí se podrían elegir ganadores reales si hubiera lista de participantes

    res.json({ success: true, giveaway });
  } catch (error) {
    console.error('Error finalizando sorteo:', error);
    res.status(500).json({ error: 'Error finalizando sorteo' });
  }
});

export default router;
