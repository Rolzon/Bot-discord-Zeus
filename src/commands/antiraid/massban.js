import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('massban')
    .setDescription('Banea múltiples usuarios por ID')
    .addStringOption(option =>
      option.setName('ids')
        .setDescription('IDs de usuarios separados por espacios')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('razon')
        .setDescription('Razón del baneo masivo')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  
  async execute(interaction) {
    const idsString = interaction.options.getString('ids');
    const reason = interaction.options.getString('razon') || 'Baneo masivo';
    const ids = idsString.split(' ').filter(id => id.length > 0);
    
    if (ids.length === 0) {
      return interaction.reply({ content: '❌ No se proporcionaron IDs válidos.', ephemeral: true });
    }
    
    if (ids.length > 50) {
      return interaction.reply({ content: '❌ Máximo 50 usuarios por comando.', ephemeral: true });
    }
    
    await interaction.deferReply({ ephemeral: true });
    
    let banned = 0;
    let failed = 0;
    
    for (const id of ids) {
      try {
        await interaction.guild.members.ban(id, { reason: reason });
        banned++;
      } catch (error) {
        failed++;
        console.error(`Error baneando ${id}:`, error.message);
      }
    }
    
    await interaction.editReply({
      content: `✅ **Baneo Masivo Completado**\n\n` +
        `✅ Baneados: ${banned}\n` +
        `❌ Fallidos: ${failed}\n` +
        `📝 Razón: ${reason}`
    });
  }
};
