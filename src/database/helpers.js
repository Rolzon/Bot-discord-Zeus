import { User, Message, Giveaway, Ticket, Guild } from './models/index.js';
import { isDBConnected } from './connection.js';

/**
 * Obtiene o crea un usuario en la base de datos
 */
export async function getOrCreateUser(guildId, userId, username = '', discriminator = '') {
  if (!isDBConnected()) return null;
  
  try {
    let user = await User.findOne({ guildId, userId });
    
    if (!user) {
      user = await User.create({
        guildId,
        userId,
        username,
        discriminator
      });
    } else if (username && user.username !== username) {
      user.username = username;
      user.discriminator = discriminator;
      await user.save();
    }
    
    return user;
  } catch (error) {
    console.error('Error en getOrCreateUser:', error);
    return null;
  }
}

/**
 * Actualiza el XP y nivel de un usuario
 */
export async function updateUserXP(guildId, userId, xpGained, username = '') {
  if (!isDBConnected()) return null;
  
  try {
    const user = await getOrCreateUser(guildId, userId, username);
    if (!user) return null;
    
    user.xp += xpGained;
    user.messages += 1;
    user.lastMessageAt = new Date();
    
    // Calcular si subió de nivel
    const xpNeeded = calculateXPForLevel(user.level + 1);
    let leveledUp = false;
    
    if (user.xp >= xpNeeded) {
      user.level += 1;
      user.xp = user.xp - xpNeeded;
      leveledUp = true;
    }
    
    await user.save();
    
    return { user, leveledUp };
  } catch (error) {
    console.error('Error en updateUserXP:', error);
    return null;
  }
}

/**
 * Obtiene el ranking de usuarios por XP
 */
export async function getLeaderboard(guildId, limit = 10) {
  if (!isDBConnected()) return [];
  
  try {
    return await User.find({ guildId })
      .sort({ xp: -1, level: -1 })
      .limit(limit)
      .select('userId username level xp messages');
  } catch (error) {
    console.error('Error en getLeaderboard:', error);
    return [];
  }
}

/**
 * Guarda un mensaje en la base de datos
 */
export async function saveMessage(messageData) {
  if (!isDBConnected()) return null;
  
  try {
    const message = await Message.create(messageData);
    
    // Actualizar estadísticas del servidor
    await Guild.findOneAndUpdate(
      { guildId: messageData.guildId },
      { $inc: { 'stats.totalMessages': 1 } },
      { upsert: true }
    );
    
    return message;
  } catch (error) {
    console.error('Error en saveMessage:', error);
    return null;
  }
}

/**
 * Agrega una advertencia a un usuario
 */
export async function addWarning(guildId, userId, reason, moderator, username = '') {
  if (!isDBConnected()) return null;
  
  try {
    const user = await getOrCreateUser(guildId, userId, username);
    if (!user) return null;
    
    user.warnings.push({
      reason,
      moderator,
      timestamp: new Date()
    });
    
    await user.save();
    return user.warnings;
  } catch (error) {
    console.error('Error en addWarning:', error);
    return null;
  }
}

/**
 * Obtiene las advertencias de un usuario
 */
export async function getWarnings(guildId, userId) {
  if (!isDBConnected()) return [];
  
  try {
    const user = await User.findOne({ guildId, userId });
    return user ? user.warnings : [];
  } catch (error) {
    console.error('Error en getWarnings:', error);
    return [];
  }
}

/**
 * Limpia las advertencias de un usuario
 */
export async function clearWarnings(guildId, userId) {
  if (!isDBConnected()) return false;
  
  try {
    await User.findOneAndUpdate(
      { guildId, userId },
      { $set: { warnings: [] } }
    );
    return true;
  } catch (error) {
    console.error('Error en clearWarnings:', error);
    return false;
  }
}

/**
 * Guarda o actualiza un sorteo
 */
export async function saveGiveaway(giveawayData) {
  if (!isDBConnected()) return null;
  
  try {
    return await Giveaway.findOneAndUpdate(
      { messageId: giveawayData.messageId },
      giveawayData,
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Error en saveGiveaway:', error);
    return null;
  }
}

/**
 * Obtiene sorteos activos
 */
export async function getActiveGiveaways(guildId) {
  if (!isDBConnected()) return [];
  
  try {
    return await Giveaway.find({
      guildId,
      isEnded: false,
      endTime: { $gt: new Date() }
    });
  } catch (error) {
    console.error('Error en getActiveGiveaways:', error);
    return [];
  }
}

/**
 * Guarda o actualiza un ticket
 */
export async function saveTicket(ticketData) {
  if (!isDBConnected()) return null;
  
  try {
    return await Ticket.findOneAndUpdate(
      { channelId: ticketData.channelId },
      ticketData,
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Error en saveTicket:', error);
    return null;
  }
}

/**
 * Obtiene o crea configuración de servidor
 */
export async function getOrCreateGuild(guildId, name = '') {
  if (!isDBConnected()) return null;
  
  try {
    let guild = await Guild.findOne({ guildId });
    
    if (!guild) {
      guild = await Guild.create({
        guildId,
        name
      });
    }
    
    return guild;
  } catch (error) {
    console.error('Error en getOrCreateGuild:', error);
    return null;
  }
}

// Función auxiliar para calcular XP necesario
function calculateXPForLevel(level) {
  return 5 * (level ** 2) + 50 * level + 100;
}
