import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ticket-setup')
    .setDescription('Configura el sistema de tickets')
    .addChannelOption(option =>
      option.setName('canal')
        .setDescription('Canal donde se enviará el panel de tickets')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('categoria')
        .setDescription('Categoría donde se crearán los tickets')
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    const channel = interaction.options.getChannel('canal');
    const category = interaction.options.getChannel('categoria');
    
    // Guardar configuración
    const guildId = interaction.guildId;
    const ticketConfig = {
      panelChannel: channel.id,
      category: category.id
    };
    
    interaction.client.data.tickets.set(`config-${guildId}`, ticketConfig);
    await interaction.client.data.save();
    
    // Crear embed del panel
    const embed = new EmbedBuilder()
      .setColor(interaction.client.config.embedColor)
      .setTitle('🎫 Sistema de Tickets')
      .setDescription('¿Necesitas ayuda? Crea un ticket haciendo clic en el botón de abajo.\n\n' +
        '**¿Cuándo crear un ticket?**\n' +
        '• Reportar un problema\n' +
        '• Hacer una pregunta al staff\n' +
        '• Solicitar ayuda\n' +
        '• Reportar a un usuario\n\n' +
        '**Reglas:**\n' +
        '• No abuses del sistema\n' +
        '• Sé paciente, el staff responderá pronto\n' +
        '• Proporciona toda la información necesaria')
      .setFooter({ text: 'Haz clic en el botón para abrir un ticket' })
      .setTimestamp();
    
    // Crear botón
    const button = new ButtonBuilder()
      .setCustomId('create_ticket')
      .setLabel('Crear Ticket')
      .setEmoji('🎫')
      .setStyle(ButtonStyle.Primary);
    
    const row = new ActionRowBuilder().addComponents(button);
    
    try {
      await channel.send({ embeds: [embed], components: [row] });
      await interaction.reply({ content: `✅ Panel de tickets configurado en ${channel}`, ephemeral: true });
    } catch (error) {
      console.error('Error configurando tickets:', error);
      await interaction.reply({ content: '❌ Error al configurar el sistema de tickets.', ephemeral: true });
    }
  }
};
