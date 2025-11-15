import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  channelId: {
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
  userId: {
    type: String,
    required: true,
    index: true
  },
  username: String,
  ticketNumber: {
    type: Number,
    required: true
  },
  category: String,
  status: {
    type: String,
    enum: ['open', 'closed', 'resolved'],
    default: 'open'
  },
  closedBy: String,
  closedAt: Date,
  
  // Reclamación del ticket
  claimedBy: {
    userId: String,
    username: String,
    avatar: String,
    claimedAt: Date
  },
  
  // Notas internas (solo visible para staff)
  notes: [{
    userId: String,
    username: String,
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Historial de transferencias
  transfers: [{
    fromUserId: String,
    fromUsername: String,
    toUserId: String,
    toUsername: String,
    reason: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Mensajes del ticket
  messages: [{
    userId: String,
    username: String,
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
}, {
  timestamps: true
});

// Índice compuesto para tickets por servidor
ticketSchema.index({ guildId: 1, ticketNumber: 1 }, { unique: true });

export default mongoose.model('Ticket', ticketSchema);
