import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('antiraid')
    .setDescription('Activa o desactiva el modo anti-raid')
    .addBooleanOption(option =>
      option.setName('activar')
        .setDescription('Activar o desactivar')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    const enabled = interaction.options.getBoolean('activar');
    const guildId = interaction.guildId;
    
    // Guardar configuración
    const config = interaction.client.data.tickets.get(`antiraid-${guildId}`) || {};
    config.enabled = enabled;
    config.joinThreshold = 5; // 5 usuarios en 10 segundos
    config.joinWindow = 10000; // 10 segundos
    
    interaction.client.data.tickets.set(`antiraid-${guildId}`, config);
    await interaction.client.data.save();
    
    if (enabled) {
      await interaction.reply('✅ **Modo Anti-Raid activado**\n\n' +
        'El servidor está ahora protegido contra raids.\n' +
        '• Se detectarán entradas masivas de usuarios\n' +
        '• Se activarán medidas de protección automáticamente\n' +
        '• Los administradores serán notificados');
    } else {
      await interaction.reply('❌ **Modo Anti-Raid desactivado**\n\nLas protecciones anti-raid han sido desactivadas.');
    }
  }
};
