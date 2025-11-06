import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('nuke')
    .setDescription('Clona y elimina el canal actual (limpieza total)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  
  async execute(interaction) {
    const channel = interaction.channel;
    
    await interaction.reply('💣 Nukeing canal en 3 segundos...');
    
    setTimeout(async () => {
      try {
        // Clonar el canal
        const newChannel = await channel.clone({
          name: channel.name,
          reason: `Nuke ejecutado por ${interaction.user.tag}`
        });
        
        // Eliminar el canal original
        await channel.delete();
        
        // Enviar mensaje en el nuevo canal
        await newChannel.send(`✅ Canal nukeado por ${interaction.user}\n🔄 Este es un canal completamente nuevo.`);
        
      } catch (error) {
        console.error('Error en nuke:', error);
      }
    }, 3000);
  }
};
