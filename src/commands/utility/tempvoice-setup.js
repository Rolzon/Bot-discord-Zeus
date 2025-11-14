import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('tempvoice-setup')
    .setDescription('Configura el sistema de canales de voz temporales')
    .addChannelOption(option =>
      option.setName('canal-crear')
        .setDescription('Canal donde los usuarios se conectan para crear un canal temporal')
        .addChannelTypes(ChannelType.GuildVoice)
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('categoria')
        .setDescription('Categoría donde se crearán los canales temporales')
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(false))
    .addStringOption(option =>
      option.setName('nombre-plantilla')
        .setDescription('Plantilla del nombre del canal (usa {username} para el nombre del usuario)')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('limite-usuarios')
        .setDescription('Límite de usuarios por canal temporal (0 = sin límite)')
        .setMinValue(0)
        .setMaxValue(99)
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const createChannel = interaction.options.getChannel('canal-crear');
    const category = interaction.options.getChannel('categoria');
    const nameTemplate = interaction.options.getString('nombre-plantilla') || '🔊 {username}';
    const userLimit = interaction.options.getInteger('limite-usuarios') || 0;

    // Verificar permisos del bot
    const botMember = interaction.guild.members.me;
    if (!botMember.permissions.has([PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers])) {
      return interaction.reply({
        content: '❌ Necesito permisos de **Gestionar Canales** y **Mover Miembros** para usar TempVoice.',
        ephemeral: true
      });
    }

    // Inicializar configuración si no existe
    if (!interaction.client.tempVoiceConfig) {
      interaction.client.tempVoiceConfig = new Map();
    }

    // Guardar configuración
    const config = {
      createChannelId: createChannel.id,
      categoryId: category?.id || createChannel.parentId,
      channelName: nameTemplate,
      userLimit: userLimit,
      bitrate: 64000
    };

    interaction.client.tempVoiceConfig.set(interaction.guild.id, config);

    // Crear embed de confirmación
    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('✅ TempVoice Configurado')
      .setDescription('El sistema de canales de voz temporales ha sido configurado correctamente.')
      .addFields(
        { name: '🎤 Canal para Crear', value: `${createChannel}`, inline: true },
        { name: '📁 Categoría', value: category ? `${category}` : 'Misma que el canal crear', inline: true },
        { name: '📝 Plantilla de Nombre', value: `\`${nameTemplate}\``, inline: true },
        { name: '👥 Límite de Usuarios', value: userLimit === 0 ? 'Sin límite' : `${userLimit} usuarios`, inline: true },
        { name: '🔧 Cómo Funciona', value: 'Los usuarios se conectan al **Canal para Crear** y automáticamente se les creará un canal temporal propio que se eliminará cuando esté vacío.', inline: false }
      )
      .setFooter({ text: 'El propietario del canal temporal tendrá permisos de administración sobre su canal.' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    // Log de configuración
    console.log(`🔧 TempVoice configurado en ${interaction.guild.name}:`, config);
  }
};
