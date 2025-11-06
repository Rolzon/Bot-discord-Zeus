import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
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
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  username: String,
  content: String,
  
  // Información adicional
  attachments: [{
    url: String,
    name: String,
    size: Number
  }],
  
  embeds: Number,
  mentions: [String],
  
  // Metadata
  isEdited: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  deletedAt: Date,
  
  // Respuestas de IA
  isAIResponse: {
    type: Boolean,
    default: false
  },
  aiModel: String,
  
}, {
  timestamps: true
});

// Índices para búsquedas eficientes
messageSchema.index({ guildId: 1, channelId: 1, createdAt: -1 });
messageSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Message', messageSchema);
