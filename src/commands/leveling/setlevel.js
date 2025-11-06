import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setlevel')
    .setDescription('Establece el nivel de un usuario')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuario a modificar')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('nivel')
        .setDescription('Nuevo nivel')
        .setMinValue(0)
        .setMaxValue(1000)
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    const target = interaction.options.getUser('usuario');
    const newLevel = interaction.options.getInteger('nivel');
    const userId = `${interaction.guildId}-${target.id}`;
    
    const userData = interaction.client.data.levels.get(userId) || { xp: 0, level: 0, messages: 0 };
    userData.level = newLevel;
    userData.xp = 0;
    
    interaction.client.data.levels.set(userId, userData);
    await interaction.client.data.save();
    
    await interaction.reply(`✅ Nivel de ${target.tag} establecido a **${newLevel}**.`);
  }
};
