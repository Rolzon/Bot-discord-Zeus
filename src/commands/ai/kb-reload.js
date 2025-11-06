import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('kb-reload')
    .setDescription('Recarga la base de conocimiento (aplica cambios)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    await interaction.reply({ content: '🔄 Recargando base de conocimiento...', ephemeral: true });
    
    try {
      // El sistema se recargará automáticamente en el próximo mensaje
      // Ya que lee el archivo cada vez
      
      await interaction.editReply({ 
        content: '✅ **Base de conocimiento lista!**\n\n' +
          'Los cambios se aplicarán en la próxima conversación con el bot.\n' +
          'Menciona al bot para probar las nuevas respuestas.'
      });
      
    } catch (error) {
      console.error('Error recargando KB:', error);
      await interaction.editReply({ content: '❌ Error al recargar la base de conocimiento.' });
    }
  }
};
