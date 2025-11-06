import mongoose from 'mongoose';

const giveawaySchema = new mongoose.Schema({
  messageId: {
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
  channelId: {
    type: String,
    required: true
  },
  hostId: {
    type: String,
    required: true
  },
  prize: {
    type: String,
    required: true
  },
  winners: {
    type: Number,
    default: 1
  },
  endTime: {
    type: Date,
    required: true,
    index: true
  },
  participants: [String],
  winnerIds: [String],
  isEnded: {
    type: Boolean,
    default: false
  },
  
}, {
  timestamps: true
});

// Índice para encontrar sorteos activos
giveawaySchema.index({ isEnded: 1, endTime: 1 });

export default mongoose.model('Giveaway', giveawaySchema);
