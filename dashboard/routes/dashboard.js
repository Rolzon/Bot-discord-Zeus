import express from 'express';
import { dashboardClient, io } from '../server.js';

const router = express.Router();

// Middleware para verificar permisos de administrador en el servidor
async function ensureGuildAdmin(req, res, next) {
  const guildId = req.params.guildId;
  
  try {
    const guild = await dashboardClient.guilds.fetch(guildId);
    const member = await guild.members.fetch(req.user.id);
    
    if (member.permissions.has('Administrator') || member.permissions.has('ManageGuild')) {
      req.guild = guild;
      req.member = member;
      return next();
    }
    
    return res.status(403).render('error', { 
      error: 'No tienes permisos de administrador en este servidor',
      user: req.user 
    });
  } catch (error) {
    return res.status(404).render('error', { 
      error: 'Servidor no encontrado',
      user: req.user 
    });
  }
}

// Dashboard principal del servidor
router.get('/:guildId', ensureGuildAdmin, async (req, res) => {
  try {
    const guild = req.guild;
    
    // Obtener estadísticas básicas
    const stats = {
      members: guild.memberCount,
      channels: guild.channels.cache.size,
      roles: guild.roles.cache.size,
      emojis: guild.emojis.cache.size,
      boosts: guild.premiumSubscriptionCount || 0
    };

    // Obtener canales por tipo
    const channels = {
      text: guild.channels.cache.filter(c => c.type === 0).size,
      voice: guild.channels.cache.filter(c => c.type === 2).size,
      category: guild.channels.cache.filter(c => c.type === 4).size,
      stage: guild.channels.cache.filter(c => c.type === 13).size
    };

    res.render('guild/overview', {
      user: req.user,
      guild: guild,
      stats: stats,
      channels: channels
    });
  } catch (error) {
    console.error('Error en dashboard del servidor:', error);
    res.render('error', { 
      error: 'Error cargando información del servidor',
      user: req.user 
    });
  }
});

// Gestión de moderación
router.get('/:guildId/moderation', ensureGuildAdmin, async (req, res) => {
  try {
    const guild = req.guild;
    
    // Aquí se conectaría con la base de datos para obtener logs de moderación
    const moderationLogs = []; // Placeholder
    const warnings = []; // Placeholder
    const bans = await guild.bans.fetch();

    res.render('guild/moderation', {
      user: req.user,
      guild: guild,
      moderationLogs: moderationLogs,
      warnings: warnings,
      bans: Array.from(bans.values())
    });
  } catch (error) {
    console.error('Error en moderación:', error);
    res.render('error', { 
      error: 'Error cargando datos de moderación',
      user: req.user 
    });
  }
});

// Gestión de música
router.get('/:guildId/music', ensureGuildAdmin, async (req, res) => {
  try {
    const guild = req.guild;
    
    // Obtener información de la cola de música (si existe)
    const musicQueue = null; // Se conectaría con discord-player
    
    res.render('guild/music', {
      user: req.user,
      guild: guild,
      queue: musicQueue
    });
  } catch (error) {
    console.error('Error en música:', error);
    res.render('error', { 
      error: 'Error cargando datos de música',
      user: req.user 
    });
  }
});

// Gestión de niveles y XP
router.get('/:guildId/levels', ensureGuildAdmin, async (req, res) => {
  try {
    const guild = req.guild;
    
    // Aquí se conectaría con MongoDB para obtener datos de niveles
    const leaderboard = []; // Placeholder
    
    res.render('guild/levels', {
      user: req.user,
      guild: guild,
      leaderboard: leaderboard
    });
  } catch (error) {
    console.error('Error en niveles:', error);
    res.render('error', { 
      error: 'Error cargando datos de niveles',
      user: req.user 
    });
  }
});

// Gestión de sorteos
router.get('/:guildId/giveaways', ensureGuildAdmin, async (req, res) => {
  try {
    const guild = req.guild;
    
    // Obtener sorteos activos
    const activeGiveaways = []; // Placeholder
    
    res.render('guild/giveaways', {
      user: req.user,
      guild: guild,
      giveaways: activeGiveaways
    });
  } catch (error) {
    console.error('Error en sorteos:', error);
    res.render('error', { 
      error: 'Error cargando datos de sorteos',
      user: req.user 
    });
  }
});

// Gestión de TempVoice
router.get('/:guildId/tempvoice', ensureGuildAdmin, async (req, res) => {
  try {
    const guild = req.guild;
    
    // Obtener configuración de TempVoice
    const tempVoiceConfig = null; // Se conectaría con la configuración del bot
    const activeTempChannels = guild.channels.cache.filter(c => 
      c.isVoiceBased() && c.name.includes('🔊')
    );
    
    res.render('guild/tempvoice', {
      user: req.user,
      guild: guild,
      config: tempVoiceConfig,
      activeChannels: Array.from(activeTempChannels.values())
    });
  } catch (error) {
    console.error('Error en TempVoice:', error);
    res.render('error', { 
      error: 'Error cargando datos de TempVoice',
      user: req.user 
    });
  }
});

// Base de conocimiento (IA)
router.get('/:guildId/knowledge', ensureGuildAdmin, async (req, res) => {
  try {
    const guild = req.guild;
    
    // Cargar base de conocimiento
    const knowledgeBase = []; // Se cargaría desde knowledge-base.json
    
    res.render('guild/knowledge', {
      user: req.user,
      guild: guild,
      knowledgeBase: knowledgeBase
    });
  } catch (error) {
    console.error('Error en base de conocimiento:', error);
    res.render('error', { 
      error: 'Error cargando base de conocimiento',
      user: req.user 
    });
  }
});

// Configuración del servidor
router.get('/:guildId/settings', ensureGuildAdmin, async (req, res) => {
  try {
    const guild = req.guild;
    
    // Obtener configuración actual del bot para este servidor
    const botConfig = {}; // Placeholder
    
    res.render('guild/settings', {
      user: req.user,
      guild: guild,
      config: botConfig
    });
  } catch (error) {
    console.error('Error en configuración:', error);
    res.render('error', { 
      error: 'Error cargando configuración',
      user: req.user 
    });
  }
});

// Logs del servidor
router.get('/:guildId/logs', ensureGuildAdmin, async (req, res) => {
  try {
    const guild = req.guild;
    
    // Obtener logs recientes
    const logs = []; // Se conectaría con MongoDB
    
    res.render('guild/logs', {
      user: req.user,
      guild: guild,
      logs: logs
    });
  } catch (error) {
    console.error('Error en logs:', error);
    res.render('error', { 
      error: 'Error cargando logs',
      user: req.user 
    });
  }
});

export default router;
