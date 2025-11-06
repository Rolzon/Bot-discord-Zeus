import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    console.log('✅ Ya conectado a MongoDB');
    return;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.log('⚠️ MONGODB_URI no configurado. El bot funcionará sin base de datos.');
      return;
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = true;
    console.log('✅ Conectado a MongoDB');

    mongoose.connection.on('error', (err) => {
      console.error('❌ Error de MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB desconectado');
      isConnected = false;
    });

  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    console.log('⚠️ El bot continuará sin base de datos');
  }
}

export function isDBConnected() {
  return isConnected;
}
