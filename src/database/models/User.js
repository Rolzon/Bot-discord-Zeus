import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  guildId: {
    type: String,
    required: true,
    index: true
  },
  username: String,
  discriminator: String,
  
  // Sistema de niveles
  level: {
    type: Number,
    default: 0
  },
  xp: {
    type: Number,
    default: 0
  },
  messages: {
    type: Number,
    default: 0
  },
  
  // Moderación
  warnings: [{
    reason: String,
    moderator: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Estadísticas
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastMessageAt: Date,
  
}, {
  timestamps: true
});

// Índice compuesto para búsquedas eficientes
userSchema.index({ guildId: 1, userId: 1 }, { unique: true });
userSchema.index({ guildId: 1, xp: -1 }); // Para leaderboards

export default mongoose.model('User', userSchema);
