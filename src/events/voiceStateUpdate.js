import { Events, ChannelType, PermissionFlagsBits } from 'discord.js';

// Mapa para trackear canales temporales creados
const tempChannels = new Map();

export default {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState) {
    const guild = newState.guild;
    
    // Obtener configuración de TempVoice del servidor (por ahora hardcodeado, luego se puede hacer configurable)
    const tempVoiceConfig = {
      // ID del canal "Crear Canal Temporal" - cambiar por el ID real de tu servidor
      createChannelId: null, // Se configurará con comando
      categoryId: null, // Categoría donde crear los canales temporales
      channelName: '🔊 {username}', // Plantilla del nombre ({username} se reemplaza)
      userLimit: 0, // 0 = sin límite
      bitrate: 64000 // Calidad de audio
    };
    
    // Buscar configuración guardada (simulado por ahora)
    const configKey = `tempvoice-${guild.id}`;
    if (newState.client.tempVoiceConfig) {
      const savedConfig = newState.client.tempVoiceConfig.get(guild.id);
      if (savedConfig) {
        Object.assign(tempVoiceConfig, savedConfig);
      }
    }
    
    // Si no hay configuración, no hacer nada
    if (!tempVoiceConfig.createChannelId) return;
    
    // CREAR CANAL TEMPORAL
    // Si el usuario se unió al canal "Crear Canal Temporal"
    if (newState.channelId === tempVoiceConfig.createChannelId && newState.member) {
      try {
        // Crear canal temporal
        const tempChannel = await guild.channels.create({
          name: tempVoiceConfig.channelName.replace('{username}', newState.member.displayName),
          type: ChannelType.GuildVoice,
          parent: tempVoiceConfig.categoryId,
          userLimit: tempVoiceConfig.userLimit,
          bitrate: tempVoiceConfig.bitrate,
          permissionOverwrites: [
            {
              id: newState.member.id,
              allow: [
                PermissionFlagsBits.ManageChannels,
                PermissionFlagsBits.MoveMembers,
                PermissionFlagsBits.MuteMembers,
                PermissionFlagsBits.DeafenMembers
              ]
            },
            {
              id: guild.roles.everyone.id,
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
            }
          ]
        });
        
        // Mover al usuario al canal temporal
        await newState.member.voice.setChannel(tempChannel);
        
        // Guardar referencia del canal temporal
        tempChannels.set(tempChannel.id, {
          ownerId: newState.member.id,
          createdAt: Date.now()
        });
        
        console.log(`✅ Canal temporal creado: ${tempChannel.name} para ${newState.member.displayName}`);
        
      } catch (error) {
        console.error('Error creando canal temporal:', error);
      }
    }
    
    // ELIMINAR CANAL TEMPORAL
    // Si alguien salió de un canal de voz
    if (oldState.channelId && oldState.channel) {
      const channelInfo = tempChannels.get(oldState.channelId);
      
      // Si es un canal temporal y está vacío
      if (channelInfo && oldState.channel.members.size === 0) {
        try {
          await oldState.channel.delete('Canal temporal vacío');
          tempChannels.delete(oldState.channelId);
          console.log(`🗑️ Canal temporal eliminado: ${oldState.channel.name}`);
        } catch (error) {
          console.error('Error eliminando canal temporal:', error);
        }
      }
    }
    
    // LIMPIAR CANALES HUÉRFANOS (por si acaso)
    // Cada 5 minutos, verificar canales temporales que puedan haber quedado vacíos
    if (Math.random() < 0.01) { // 1% de probabilidad por evento
      cleanupOrphanedChannels(guild);
    }
  }
};

// Función para limpiar canales temporales huérfanos
async function cleanupOrphanedChannels(guild) {
  try {
    for (const [channelId, channelInfo] of tempChannels.entries()) {
      const channel = guild.channels.cache.get(channelId);
      
      if (!channel) {
        // Canal ya no existe, remover de la lista
        tempChannels.delete(channelId);
        continue;
      }
      
      if (channel.members.size === 0) {
        // Canal vacío, eliminarlo
        await channel.delete('Limpieza automática - canal temporal vacío');
        tempChannels.delete(channelId);
        console.log(`🧹 Limpieza: Canal temporal eliminado: ${channel.name}`);
      }
    }
  } catch (error) {
    console.error('Error en limpieza de canales temporales:', error);
  }
}
