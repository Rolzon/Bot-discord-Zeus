import { Events, EmbedBuilder } from 'discord.js';
import OpenAI from 'openai';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { updateUserXP, saveMessage } from '../database/helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Historial de conversaciones por canal (limitado)
const conversationHistory = new Map();
const MAX_HISTORY = 10;

// Cargar base de conocimiento
let knowledgeBase = null;
async function loadKnowledgeBase() {
  try {
    const kbPath = join(dirname(dirname(__dirname)), 'knowledge-base.json');
    const data = await readFile(kbPath, 'utf-8');
    knowledgeBase = JSON.parse(data);
    console.log('✅ Base de conocimiento cargada');
  } catch (error) {
    console.log('⚠️ No se pudo cargar la base de conocimiento');
  }
}

// Cargar al inicio
loadKnowledgeBase();

export default {
  name: Events.MessageCreate,
  async execute(message) {
    // Ignorar mensajes de bots
    if (message.author.bot) return;
    
    // Guardar mensaje en MongoDB
    await saveMessage({
      messageId: message.id,
      guildId: message.guildId,
      channelId: message.channelId,
      userId: message.author.id,
      username: message.author.tag,
      content: message.content,
      attachments: message.attachments.map(a => ({
        url: a.url,
        name: a.name,
        size: a.size
      })),
      embeds: message.embeds.length,
      mentions: message.mentions.users.map(u => u.id)
    });
    
    // Sistema de XP/Leveling
    await handleLeveling(message);
    
    // Responder a todos los mensajes (excepto de bots)
    await handleGPTResponse(message);
    
    // Sistema de auto-moderación básico
    await autoModeration(message);
  }
};

async function handleGPTResponse(message) {
  try {
    // Obtener el mensaje (quitar menciones si las hay)
    const userMessage = message.content
      .replace(/<@!?\d+>/g, '')
      .trim();
    
    if (!userMessage) {
      return message.reply('¿En qué puedo ayudarte? 😊');
    }
    
    // Mostrar que el bot está escribiendo
    await message.channel.sendTyping();
    
    // Obtener o crear historial del canal
    if (!conversationHistory.has(message.channelId)) {
      conversationHistory.set(message.channelId, []);
    }
    
    const history = conversationHistory.get(message.channelId);
    
    // Buscar información relevante en la base de conocimiento
    let contextInfo = '';
    if (knowledgeBase) {
      const relevantFAQs = findRelevantFAQs(userMessage, knowledgeBase.faqs);
      if (relevantFAQs.length > 0) {
        contextInfo = '\n\nINFORMACIÓN DE LA BASE DE CONOCIMIENTO:\n';
        relevantFAQs.forEach(faq => {
          contextInfo += `- ${faq.answer}\n`;
        });
        contextInfo += '\nUsa esta información para responder de manera natural y conversacional. No copies exactamente, sino adapta la respuesta al contexto.';
      }
    }
    
    // Construir prompt del sistema con contexto
    const systemPrompt = message.client.config.gptSystemPrompt + 
      (knowledgeBase ? `\n\nTrabajás para ${knowledgeBase.company.name} (${knowledgeBase.company.website}), ${knowledgeBase.company.description}.\n${knowledgeBase.instructions}` : '') +
      contextInfo;
    
    // Construir mensajes para GPT
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...history,
      {
        role: 'user',
        content: userMessage
      }
    ];
    
    // Llamar a GPT-3.5-turbo
    const completion = await openai.chat.completions.create({
      model: message.client.config.gptModel,
      messages: messages,
      max_tokens: message.client.config.gptMaxTokens,
      temperature: message.client.config.gptTemperature
    });
    
    const response = completion.choices[0].message.content;
    
    // Actualizar historial
    history.push(
      { role: 'user', content: userMessage },
      { role: 'assistant', content: response }
    );
    
    // Limitar el tamaño del historial
    if (history.length > MAX_HISTORY * 2) {
      history.splice(0, 2);
    }
    
    // Crear embed con la respuesta
    const embed = new EmbedBuilder()
      .setColor('#5865F2') // Color azul de Discord
      .setAuthor({
        name: message.client.user.username,
        iconURL: message.client.user.displayAvatarURL()
      })
      .setFooter({
        text: `Respondiendo a ${message.author.username}`,
        iconURL: message.author.displayAvatarURL()
      })
      .setTimestamp();
    
    // Dividir respuesta si es muy larga (límite de 4096 caracteres para description)
    if (response.length > 4096) {
      // Para respuestas muy largas, dividir en múltiples embeds
      const chunks = response.match(/.{1,4096}/gs) || [response];
      
      for (let i = 0; i < chunks.length; i++) {
        const chunkEmbed = new EmbedBuilder()
          .setColor('#5865F2')
          .setDescription(chunks[i])
          .setFooter({
            text: `Respondiendo a ${message.author.username} • Parte ${i + 1}/${chunks.length}`,
            iconURL: message.author.displayAvatarURL()
          })
          .setTimestamp();
        
        if (i === 0) {
          chunkEmbed.setAuthor({
            name: message.client.user.username,
            iconURL: message.client.user.displayAvatarURL()
          });
        }
        
        await message.reply({ embeds: [chunkEmbed] });
      }
    } else {
      embed.setDescription(response);
      await message.reply({ embeds: [embed] });
    }
    
  } catch (error) {
    console.error('Error con GPT:', error);
    
    if (error.code === 'insufficient_quota') {
      await message.reply('❌ La cuota de la API de OpenAI se ha agotado. Por favor, contacta al administrador del bot.');
    } else if (error.status === 401) {
      await message.reply('❌ Error de autenticación con OpenAI. Verifica la API key.');
    } else {
      await message.reply('❌ Lo siento, hubo un error al procesar tu mensaje. Inténtalo de nuevo más tarde.');
    }
  }
}

async function autoModeration(message) {
  // Lista de palabras prohibidas (ejemplo básico)
  const bannedWords = ['spam', 'hack', 'cheat'];
  const content = message.content.toLowerCase();
  
  // Detectar spam de mayúsculas
  if (message.content.length > 50) {
    const uppercaseRatio = (message.content.match(/[A-Z]/g) || []).length / message.content.length;
    if (uppercaseRatio > 0.7) {
      await message.delete();
      await message.channel.send(`${message.author}, por favor no uses tantas mayúsculas.`);
      return;
    }
  }
  
  // Detectar palabras prohibidas
  for (const word of bannedWords) {
    if (content.includes(word)) {
      await message.delete();
      await message.channel.send(`${message.author}, ese contenido no está permitido.`);
      return;
    }
  }
  
  // Detectar spam de menciones
  if (message.mentions.users.size > 5) {
    await message.delete();
    await message.channel.send(`${message.author}, no hagas spam de menciones.`);
    return;
  }
}

async function handleLeveling(message) {
  // Cooldown para evitar spam de XP (60 segundos)
  const cooldownKey = `xp-${message.guildId}-${message.author.id}`;
  const lastXP = message.client.cooldowns.get(cooldownKey);
  
  if (lastXP && Date.now() - lastXP < 60000) return;
  
  message.client.cooldowns.set(cooldownKey, Date.now());
  
  // Ganar XP aleatorio entre 15-25
  const xpGained = Math.floor(Math.random() * 11) + 15;
  
  // Actualizar en MongoDB
  const result = await updateUserXP(
    message.guildId,
    message.author.id,
    xpGained,
    message.author.tag
  );
  
  // Si MongoDB está disponible y el usuario subió de nivel
  if (result && result.leveledUp) {
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🎉 ¡Nivel Subido!')
      .setDescription(`${message.author} ha alcanzado el **Nivel ${result.user.level}**!`)
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setTimestamp();
    
    await message.channel.send({ embeds: [embed] });
  }
  
  // Fallback: guardar en memoria si MongoDB no está disponible
  if (!result) {
    const userId = `${message.guildId}-${message.author.id}`;
    const userData = message.client.data.levels.get(userId) || { xp: 0, level: 0, messages: 0 };
    
    userData.xp += xpGained;
    userData.messages += 1;
    
    const xpNeeded = calculateXPForLevel(userData.level + 1);
    
    if (userData.xp >= xpNeeded) {
      userData.level += 1;
      userData.xp = userData.xp - xpNeeded;
      
      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🎉 ¡Nivel Subido!')
        .setDescription(`${message.author} ha alcanzado el **Nivel ${userData.level}**!`)
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setTimestamp();
      
      await message.channel.send({ embeds: [embed] });
    }
    
    message.client.data.levels.set(userId, userData);
  }
}

function calculateXPForLevel(level) {
  return 5 * (level ** 2) + 50 * level + 100;
}

// Función para buscar FAQs relevantes basándose en palabras clave
function findRelevantFAQs(userMessage, faqs) {
  const messageLower = userMessage.toLowerCase();
  const relevantFAQs = [];
  
  for (const faq of faqs) {
    // Verificar si alguna palabra clave coincide
    const hasMatch = faq.keywords.some(keyword => 
      messageLower.includes(keyword.toLowerCase())
    );
    
    if (hasMatch) {
      relevantFAQs.push(faq);
    }
  }
  
  // Limitar a las 3 FAQs más relevantes
  return relevantFAQs.slice(0, 3);
}
