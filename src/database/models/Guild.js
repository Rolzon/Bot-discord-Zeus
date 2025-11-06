import mongoose from 'mongoose';

const guildSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: String,
  ownerId: String,
  
  // Configuración del servidor
  settings: {
    prefix: {
      type: String,
      default: '!'
    },
    logChannel: String,
    welcomeChannel: String,
    levelUpChannel: String,
    muteRole: String,
    
    // Anti-raid
    antiRaid: {
      enabled: {
        type: Boolean,
        default: false
      },
      joinThreshold: {
        type: Number,
        default: 5
      },
      timeWindow: {
        type: Number,
        default: 10
      }
    },
    
    // Anti-spam
    antiSpam: {
      enabled: {
        type: Boolean,
        default: false
      },
      messageThreshold: {
        type: Number,
        default: 5
      },
      timeWindow: {
        type: Number,
        default: 5
      }
    }
  },
  
  // Estadísticas
  stats: {
    totalMessages: {
      type: Number,
      default: 0
    },
    totalMembers: {
      type: Number,
      default: 0
    },
    totalCommands: {
      type: Number,
      default: 0
    }
  },
  
  // Metadata
  joinedAt: {
    type: Date,
    default: Date.now
  },
  
}, {
  timestamps: true
});

export default mongoose.model('Guild', guildSchema);
