import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('gpt-toggle')
    .setDescription('Activa o desactiva las respuestas automáticas de ChatGPT en este canal')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const channel = interaction.channel;

    if (!channel || !interaction.guildId) {
      return interaction.reply({
        content: 'Este comando solo puede usarse dentro de un servidor.',
        ephemeral: true
      });
    }

    const pausedChannels = interaction.client.data.gptPausedChannels;
    const key = channel.id;

    const isPaused = pausedChannels.has(key);

    if (isPaused) {
      pausedChannels.delete(key);
      return interaction.reply({
        content: `✅ ChatGPT ahora está **ACTIVADO** en este canal (<#${key}>).\n\nSolo tú ves este mensaje.`,
        ephemeral: true
      });
    } else {
      pausedChannels.add(key);
      return interaction.reply({
        content: `⏸️ ChatGPT ahora está **PAUSADO** en este canal (<#${key}>).\n\nSolo tú ves este mensaje.`,
        ephemeral: true
      });
    }
  }
};
