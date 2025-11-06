import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('lockdown')
    .setDescription('Bloquea todos los canales de texto')
    .addBooleanOption(option =>
      option.setName('activar')
        .setDescription('Activar o desactivar lockdown')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    const enabled = interaction.options.getBoolean('activar');
    await interaction.deferReply();
    
    try {
      const textChannels = interaction.guild.channels.cache.filter(ch => ch.isTextBased());
      let count = 0;
      
      for (const [, channel] of textChannels) {
        try {
          await channel.permissionOverwrites.edit(interaction.guild.id, {
            SendMessages: !enabled
          });
          count++;
        } catch (error) {
          console.error(`Error en canal ${channel.name}:`, error);
        }
      }
      
      if (enabled) {
        await interaction.editReply(`🔒 **Servidor en Lockdown**\n\n${count} canales bloqueados. Solo el staff puede enviar mensajes.`);
      } else {
        await interaction.editReply(`🔓 **Lockdown Desactivado**\n\n${count} canales desbloqueados.`);
      }
      
    } catch (error) {
      console.error('Error en lockdown:', error);
      await interaction.editReply({ content: '❌ Error al ejecutar el lockdown.' });
    }
  }
};
