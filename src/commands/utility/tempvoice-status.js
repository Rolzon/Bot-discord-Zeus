import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('tempvoice-status')
    .setDescription('Muestra el estado del sistema TempVoice')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const guild = interaction.guild;
    
    // Obtener configuración
    const config = interaction.client.tempVoiceConfig?.get(guild.id);
    
    if (!config) {
      return interaction.reply({
        content: '❌ TempVoice no está configurado en este servidor. Usa `/tempvoice-setup` para configurarlo.',
        ephemeral: true
      });
    }

    // Buscar canal de creación
    const createChannel = guild.channels.cache.get(config.createChannelId);
    const category = config.categoryId ? guild.channels.cache.get(config.categoryId) : null;

    // Contar canales temporales activos
    const tempChannels = guild.channels.cache.filter(channel => 
      channel.isVoiceBased() && 
      channel.name.includes('🔊') && 
      channel.parentId === config.categoryId
    );

    // Calcular estadísticas
    const totalUsers = tempChannels.reduce((total, channel) => total + channel.members.size, 0);
    const activeChannels = tempChannels.filter(channel => channel.members.size > 0).size;

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('📊 Estado del Sistema TempVoice')
      .setDescription('Información actual del sistema de canales temporales')
      .addFields(
        { 
          name: '⚙️ Configuración', 
          value: `**Canal Crear:** ${createChannel ? createChannel.toString() : '❌ No encontrado'}\n**Categoría:** ${category ? category.name : 'Sin categoría'}\n**Plantilla:** \`${config.channelName}\`\n**Límite:** ${config.userLimit === 0 ? 'Sin límite' : `${config.userLimit} usuarios`}`, 
          inline: false 
        },
        { 
          name: '📈 Estadísticas', 
          value: `**Canales Totales:** ${tempChannels.size}\n**Canales Activos:** ${activeChannels}\n**Usuarios Conectados:** ${totalUsers}`, 
          inline: true 
        },
        { 
          name: '🔧 Estado del Bot', 
          value: `**Permisos:** ${guild.members.me.permissions.has([PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers]) ? '✅ Correctos' : '❌ Faltan permisos'}\n**Sistema:** ${config ? '✅ Activo' : '❌ Inactivo'}`, 
          inline: true 
        }
      )
      .setFooter({ text: 'Los canales temporales se eliminan automáticamente cuando están vacíos' })
      .setTimestamp();

    // Añadir lista de canales activos si hay pocos
    if (activeChannels > 0 && activeChannels <= 10) {
      const activeChannelsList = tempChannels
        .filter(channel => channel.members.size > 0)
        .map(channel => `• **${channel.name}** (${channel.members.size} usuarios)`)
        .join('\n');
      
      if (activeChannelsList) {
        embed.addFields({ 
          name: '🎤 Canales Activos', 
          value: activeChannelsList, 
          inline: false 
        });
      }
    }

    await interaction.reply({ embeds: [embed] });
  }
};
