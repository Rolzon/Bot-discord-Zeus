import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Elimina mensajes del canal')
    .addIntegerOption(option =>
      option.setName('cantidad')
        .setDescription('Cantidad de mensajes a eliminar (1-100)')
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true))
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Eliminar solo mensajes de este usuario')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  
  async execute(interaction) {
    const amount = interaction.options.getInteger('cantidad');
    const targetUser = interaction.options.getUser('usuario');
    
    await interaction.deferReply({ ephemeral: true });
    
    try {
      let messages = await interaction.channel.messages.fetch({ limit: amount });
      
      // Filtrar por usuario si se especificó
      if (targetUser) {
        messages = messages.filter(msg => msg.author.id === targetUser.id);
      }
      
      // Discord no permite eliminar mensajes de más de 14 días
      messages = messages.filter(msg => Date.now() - msg.createdTimestamp < 1209600000);
      
      if (messages.size === 0) {
        return interaction.editReply({ content: '❌ No hay mensajes para eliminar (pueden ser muy antiguos).' });
      }
      
      await interaction.channel.bulkDelete(messages, true);
      
      const response = targetUser 
        ? `✅ Se eliminaron ${messages.size} mensaje(s) de ${targetUser.tag}.`
        : `✅ Se eliminaron ${messages.size} mensaje(s).`;
      
      await interaction.editReply({ content: response });
      
      // Auto-eliminar el mensaje de confirmación después de 5 segundos
      setTimeout(async () => {
        try {
          await interaction.deleteReply();
        } catch (error) {
          console.log('No se pudo eliminar el mensaje de confirmación');
        }
      }, 5000);
      
    } catch (error) {
      console.error('Error al eliminar mensajes:', error);
      await interaction.editReply({ content: '❌ Hubo un error al eliminar los mensajes.' });
    }
  }
};
