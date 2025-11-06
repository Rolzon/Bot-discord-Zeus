import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('clearwarnings')
    .setDescription('Limpia las advertencias de un usuario')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuario a limpiar advertencias')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    const target = interaction.options.getUser('usuario');
    const userId = `${interaction.guild.id}-${target.id}`;
    const warnings = interaction.client.data.warnings.get(userId) || [];
    
    if (warnings.length === 0) {
      return interaction.reply({ content: `${target.tag} no tiene advertencias.`, ephemeral: true });
    }
    
    interaction.client.data.warnings.delete(userId);
    await interaction.client.data.save();
    
    await interaction.reply({ content: `✅ Se limpiaron ${warnings.length} advertencia(s) de ${target.tag}.` });
  }
};
