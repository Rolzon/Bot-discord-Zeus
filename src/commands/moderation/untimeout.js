import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('untimeout')
    .setDescription('Quita el timeout de un usuario')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuario a quitar el timeout')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  
  async execute(interaction) {
    const target = interaction.options.getUser('usuario');
    const member = interaction.guild.members.cache.get(target.id);
    
    if (!member) {
      return interaction.reply({ content: '❌ Usuario no encontrado en el servidor.', ephemeral: true });
    }
    
    if (!member.isCommunicationDisabled()) {
      return interaction.reply({ content: '❌ Este usuario no está silenciado.', ephemeral: true });
    }
    
    try {
      await member.timeout(null);
      
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🔊 Timeout Removido')
        .addFields(
          { name: '👤 Usuario', value: `${target.tag}`, inline: true },
          { name: '👮 Moderador', value: interaction.user.tag, inline: true }
        )
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Error al quitar timeout:', error);
      await interaction.reply({ content: '❌ Hubo un error al quitar el timeout.', ephemeral: true });
    }
  }
};
