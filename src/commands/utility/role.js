import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Gestiona roles de usuarios')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Añade un rol a un usuario')
        .addUserOption(option =>
          option.setName('usuario')
            .setDescription('Usuario a dar el rol')
            .setRequired(true))
        .addRoleOption(option =>
          option.setName('rol')
            .setDescription('Rol a añadir')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Quita un rol de un usuario')
        .addUserOption(option =>
          option.setName('usuario')
            .setDescription('Usuario a quitar el rol')
            .setRequired(true))
        .addRoleOption(option =>
          option.setName('rol')
            .setDescription('Rol a quitar')
            .setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const target = interaction.options.getUser('usuario');
    const role = interaction.options.getRole('rol');
    const member = interaction.guild.members.cache.get(target.id);
    
    if (!member) {
      return interaction.reply({ content: '❌ Usuario no encontrado en el servidor.', ephemeral: true });
    }
    
    // Verificar jerarquía de roles
    if (role.position >= interaction.guild.members.me.roles.highest.position) {
      return interaction.reply({ content: '❌ No puedo gestionar ese rol porque está por encima de mi rol más alto.', ephemeral: true });
    }
    
    if (role.position >= interaction.member.roles.highest.position && interaction.guild.ownerId !== interaction.user.id) {
      return interaction.reply({ content: '❌ No puedes gestionar ese rol porque está por encima de tu rol más alto.', ephemeral: true });
    }
    
    try {
      if (subcommand === 'add') {
        if (member.roles.cache.has(role.id)) {
          return interaction.reply({ content: `❌ ${target.tag} ya tiene el rol ${role.name}.`, ephemeral: true });
        }
        
        await member.roles.add(role);
        await interaction.reply({ content: `✅ Se añadió el rol ${role.name} a ${target.tag}.` });
        
      } else if (subcommand === 'remove') {
        if (!member.roles.cache.has(role.id)) {
          return interaction.reply({ content: `❌ ${target.tag} no tiene el rol ${role.name}.`, ephemeral: true });
        }
        
        await member.roles.remove(role);
        await interaction.reply({ content: `✅ Se quitó el rol ${role.name} de ${target.tag}.` });
      }
    } catch (error) {
      console.error('Error gestionando rol:', error);
      await interaction.reply({ content: '❌ Hubo un error al gestionar el rol.', ephemeral: true });
    }
  }
};
