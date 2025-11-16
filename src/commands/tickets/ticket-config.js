import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import Guild from '../../database/models/Guild.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ticket-config')
    .setDescription('Configura el sistema de tickets del servidor')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('categoria')
        .setDescription('Establece la categoría donde se crearán los tickets')
        .addChannelOption(option =>
          option
            .setName('categoria')
            .setDescription('Categoría para los tickets')
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('rol-soporte')
        .setDescription('Añade un rol que puede ver y gestionar tickets')
        .addRoleOption(option =>
          option
            .setName('rol')
            .setDescription('Rol de soporte')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remover-rol')
        .setDescription('Remueve un rol de soporte de tickets')
        .addRoleOption(option =>
          option
            .setName('rol')
            .setDescription('Rol a remover')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('transcripciones')
        .setDescription('Establece el canal para guardar transcripciones de tickets')
        .addChannelOption(option =>
          option
            .setName('canal')
            .setDescription('Canal de transcripciones')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('max-tickets')
        .setDescription('Establece el máximo de tickets abiertos por usuario')
        .addIntegerOption(option =>
          option
            .setName('cantidad')
            .setDescription('Número máximo de tickets por usuario')
            .setMinValue(1)
            .setMaxValue(5)
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('ver')
        .setDescription('Ver la configuración actual del sistema de tickets')
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    try {
      // Obtener o crear configuración del servidor
      let guildConfig = await Guild.findOne({ guildId });
      
      if (!guildConfig) {
        guildConfig = new Guild({
          guildId,
          name: interaction.guild.name,
          ownerId: interaction.guild.ownerId
        });
      }

      // Inicializar configuración de tickets si no existe
      if (!guildConfig.settings.tickets) {
        guildConfig.settings.tickets = {
          enabled: true,
          supportRoles: [],
          maxTicketsPerUser: 1
        };
      }

      switch (subcommand) {
        case 'categoria':
          await handleSetCategory(interaction, guildConfig);
          break;
        case 'rol-soporte':
          await handleAddSupportRole(interaction, guildConfig);
          break;
        case 'remover-rol':
          await handleRemoveSupportRole(interaction, guildConfig);
          break;
        case 'transcripciones':
          await handleSetTranscriptChannel(interaction, guildConfig);
          break;
        case 'max-tickets':
          await handleSetMaxTickets(interaction, guildConfig);
          break;
        case 'ver':
          await handleViewConfig(interaction, guildConfig);
          break;
      }
    } catch (error) {
      console.error('Error en ticket-config:', error);
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ Ocurrió un error al configurar el sistema de tickets.',
          ephemeral: true
        });
      }
    }
  }
};

async function handleSetCategory(interaction, guildConfig) {
  const category = interaction.options.getChannel('categoria');
  
  guildConfig.settings.tickets.categoryId = category.id;
  guildConfig.settings.tickets.categoryName = category.name;
  
  await guildConfig.save();
  
  await interaction.reply({
    embeds: [{
      title: '✅ Categoría Configurada',
      description: `La categoría de tickets ha sido establecida a **${category.name}**.\n\nTodos los tickets nuevos (desde Discord o el dashboard web) se crearán en esta categoría.`,
      color: 0x00ff00,
      fields: [
        {
          name: '📂 Categoría',
          value: `${category} (${category.name})`,
          inline: true
        },
        {
          name: '🆔 ID',
          value: category.id,
          inline: true
        }
      ],
      timestamp: new Date().toISOString()
    }]
  });
}

async function handleAddSupportRole(interaction, guildConfig) {
  const role = interaction.options.getRole('rol');
  
  if (!guildConfig.settings.tickets.supportRoles) {
    guildConfig.settings.tickets.supportRoles = [];
  }
  
  if (guildConfig.settings.tickets.supportRoles.includes(role.id)) {
    return await interaction.reply({
      content: '⚠️ Este rol ya está configurado como rol de soporte.',
      ephemeral: true
    });
  }
  
  guildConfig.settings.tickets.supportRoles.push(role.id);
  await guildConfig.save();
  
  await interaction.reply({
    embeds: [{
      title: '✅ Rol de Soporte Añadido',
      description: `El rol **${role.name}** ahora puede ver y gestionar todos los tickets.`,
      color: 0x00ff00,
      fields: [
        {
          name: '👥 Rol',
          value: `${role} (${role.name})`,
          inline: true
        },
        {
          name: '📊 Total Roles',
          value: `${guildConfig.settings.tickets.supportRoles.length} roles de soporte`,
          inline: true
        }
      ],
      timestamp: new Date().toISOString()
    }]
  });
}

async function handleRemoveSupportRole(interaction, guildConfig) {
  const role = interaction.options.getRole('rol');
  
  if (!guildConfig.settings.tickets.supportRoles || 
      !guildConfig.settings.tickets.supportRoles.includes(role.id)) {
    return await interaction.reply({
      content: '⚠️ Este rol no está configurado como rol de soporte.',
      ephemeral: true
    });
  }
  
  guildConfig.settings.tickets.supportRoles = guildConfig.settings.tickets.supportRoles.filter(
    roleId => roleId !== role.id
  );
  await guildConfig.save();
  
  await interaction.reply({
    embeds: [{
      title: '✅ Rol de Soporte Removido',
      description: `El rol **${role.name}** ya no tiene acceso automático a los tickets.`,
      color: 0xff9900,
      fields: [
        {
          name: '👥 Rol',
          value: `${role} (${role.name})`,
          inline: true
        },
        {
          name: '📊 Total Roles',
          value: `${guildConfig.settings.tickets.supportRoles.length} roles de soporte`,
          inline: true
        }
      ],
      timestamp: new Date().toISOString()
    }]
  });
}

async function handleSetTranscriptChannel(interaction, guildConfig) {
  const channel = interaction.options.getChannel('canal');
  
  guildConfig.settings.tickets.transcriptChannel = channel.id;
  await guildConfig.save();
  
  await interaction.reply({
    embeds: [{
      title: '✅ Canal de Transcripciones Configurado',
      description: `Las transcripciones de tickets cerrados se guardarán en ${channel}.`,
      color: 0x00ff00,
      fields: [
        {
          name: '📝 Canal',
          value: `${channel} (${channel.name})`,
          inline: true
        }
      ],
      timestamp: new Date().toISOString()
    }]
  });
}

async function handleSetMaxTickets(interaction, guildConfig) {
  const maxTickets = interaction.options.getInteger('cantidad');
  
  guildConfig.settings.tickets.maxTicketsPerUser = maxTickets;
  await guildConfig.save();
  
  await interaction.reply({
    embeds: [{
      title: '✅ Límite de Tickets Configurado',
      description: `Cada usuario podrá tener un máximo de **${maxTickets}** ticket(s) abierto(s) simultáneamente.`,
      color: 0x00ff00,
      fields: [
        {
          name: '🎫 Límite',
          value: `${maxTickets} ticket(s) por usuario`,
          inline: true
        }
      ],
      timestamp: new Date().toISOString()
    }]
  });
}

async function handleViewConfig(interaction, guildConfig) {
  const ticketConfig = guildConfig.settings.tickets;
  
  // Obtener información de la categoría
  let categoryInfo = 'No configurada';
  if (ticketConfig.categoryId) {
    const category = interaction.guild.channels.cache.get(ticketConfig.categoryId);
    categoryInfo = category ? `${category.name} (${category.id})` : `ID: ${ticketConfig.categoryId} (eliminada)`;
  }
  
  // Obtener roles de soporte
  let supportRolesInfo = 'Ninguno configurado';
  if (ticketConfig.supportRoles && ticketConfig.supportRoles.length > 0) {
    const roles = ticketConfig.supportRoles
      .map(roleId => {
        const role = interaction.guild.roles.cache.get(roleId);
        return role ? role.name : `ID: ${roleId}`;
      })
      .join(', ');
    supportRolesInfo = roles;
  }
  
  // Obtener canal de transcripciones
  let transcriptInfo = 'No configurado';
  if (ticketConfig.transcriptChannel) {
    const channel = interaction.guild.channels.cache.get(ticketConfig.transcriptChannel);
    transcriptInfo = channel ? `${channel.name} (${channel.id})` : `ID: ${ticketConfig.transcriptChannel} (eliminado)`;
  }
  
  await interaction.reply({
    embeds: [{
      title: '⚙️ Configuración del Sistema de Tickets',
      description: 'Configuración actual del sistema de tickets en este servidor.',
      color: 0x5865f2,
      fields: [
        {
          name: '📂 Categoría de Tickets',
          value: categoryInfo,
          inline: false
        },
        {
          name: '👥 Roles de Soporte',
          value: supportRolesInfo,
          inline: false
        },
        {
          name: '📝 Canal de Transcripciones',
          value: transcriptInfo,
          inline: false
        },
        {
          name: '🎫 Máximo de Tickets por Usuario',
          value: `${ticketConfig.maxTicketsPerUser || 1} ticket(s)`,
          inline: true
        },
        {
          name: '✅ Estado',
          value: ticketConfig.enabled ? 'Habilitado' : 'Deshabilitado',
          inline: true
        }
      ],
      footer: {
        text: 'Usa /ticket-config para modificar la configuración'
      },
      timestamp: new Date().toISOString()
    }],
    ephemeral: true
  });
}
