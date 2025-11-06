import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('antispam')
    .setDescription('Configura el sistema anti-spam')
    .addBooleanOption(option =>
      option.setName('activar')
        .setDescription('Activar o desactivar')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('mensajes')
        .setDescription('Número de mensajes permitidos')
        .setMinValue(3)
        .setMaxValue(20)
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('segundos')
        .setDescription('En cuántos segundos')
        .setMinValue(1)
        .setMaxValue(60)
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  
  async execute(interaction) {
    const enabled = interaction.options.getBoolean('activar');
    const messages = interaction.options.getInteger('mensajes') || 5;
    const seconds = interaction.options.getInteger('segundos') || 5;
    const guildId = interaction.guildId;
    
    const config = {
      enabled: enabled,
      maxMessages: messages,
      timeWindow: seconds * 1000
    };
    
    interaction.client.data.tickets.set(`antispam-${guildId}`, config);
    await interaction.client.data.save();
    
    if (enabled) {
      await interaction.reply(`✅ **Anti-Spam Activado**\n\n` +
        `Configuración:\n` +
        `• Máximo ${messages} mensajes en ${seconds} segundos\n` +
        `• Acción: Timeout automático\n` +
        `• Los infractores serán silenciados temporalmente`);
    } else {
      await interaction.reply('❌ **Anti-Spam Desactivado**');
    }
  }
};
