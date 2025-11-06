import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('resetlevels')
    .setDescription('Reinicia todos los niveles del servidor')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    await interaction.deferReply();
    
    // Eliminar todos los datos de niveles del servidor
    const keysToDelete = Array.from(interaction.client.data.levels.keys())
      .filter(key => key.startsWith(interaction.guildId));
    
    keysToDelete.forEach(key => interaction.client.data.levels.delete(key));
    await interaction.client.data.save();
    
    await interaction.editReply(`✅ Se reiniciaron ${keysToDelete.length} registros de niveles.`);
  }
};
