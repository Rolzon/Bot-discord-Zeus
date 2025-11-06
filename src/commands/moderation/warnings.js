import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('Ver las advertencias de un usuario')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuario a consultar')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  
  async execute(interaction) {
    const target = interaction.options.getUser('usuario');
    const userId = `${interaction.guild.id}-${target.id}`;
    const warnings = interaction.client.data.warnings.get(userId) || [];
    
    if (warnings.length === 0) {
      return interaction.reply({ content: `✅ ${target.tag} no tiene advertencias.`, ephemeral: true });
    }
    
    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle(`⚠️ Advertencias de ${target.tag}`)
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .setDescription(`Total: ${warnings.length}/${interaction.client.config.maxWarnings}`);
    
    warnings.forEach((warning, index) => {
      embed.addFields({
        name: `Advertencia #${index + 1}`,
        value: `**Razón:** ${warning.reason}\n**Moderador:** ${warning.moderator}\n**Fecha:** <t:${Math.floor(warning.timestamp / 1000)}:R>`
      });
    });
    
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
