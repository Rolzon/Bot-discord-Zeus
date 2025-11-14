import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('tempvoice')
    .setDescription('Gestiona tu canal de voz temporal')
    .addSubcommand(subcommand =>
      subcommand
        .setName('limite')
        .setDescription('Cambia el límite de usuarios de tu canal temporal')
        .addIntegerOption(option =>
          option.setName('cantidad')
            .setDescription('Número de usuarios (0 = sin límite)')
            .setMinValue(0)
            .setMaxValue(99)
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('nombre')
        .setDescription('Cambia el nombre de tu canal temporal')
        .addStringOption(option =>
          option.setName('nuevo-nombre')
            .setDescription('Nuevo nombre para el canal')
            .setMaxLength(100)
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('privado')
        .setDescription('Hace tu canal temporal privado (solo tú puedes invitar)'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('publico')
        .setDescription('Hace tu canal temporal público'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('kick')
        .setDescription('Expulsa a un usuario de tu canal temporal')
        .addUserOption(option =>
          option.setName('usuario')
            .setDescription('Usuario a expulsar')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('info')
        .setDescription('Muestra información de tu canal temporal')),

  async execute(interaction) {
    const member = interaction.member;
    const voiceChannel = member.voice.channel;

    // Verificar que el usuario esté en un canal de voz
    if (!voiceChannel) {
      return interaction.reply({
        content: '❌ Debes estar conectado a un canal de voz para usar este comando.',
        ephemeral: true
      });
    }

    // Verificar que sea un canal temporal (simplificado - en producción se verificaría contra la base de datos)
    const isTempChannel = voiceChannel.name.includes('🔊') || 
                         voiceChannel.permissionsFor(member).has(PermissionFlagsBits.ManageChannels);

    if (!isTempChannel) {
      return interaction.reply({
        content: '❌ Este comando solo funciona en canales de voz temporales.',
        ephemeral: true
      });
    }

    // Verificar que el usuario sea el propietario del canal
    const isOwner = voiceChannel.permissionsFor(member).has(PermissionFlagsBits.ManageChannels);
    if (!isOwner && interaction.options.getSubcommand() !== 'info') {
      return interaction.reply({
        content: '❌ Solo el propietario del canal puede usar este comando.',
        ephemeral: true
      });
    }

    const subcommand = interaction.options.getSubcommand();

    try {
      switch (subcommand) {
        case 'limite': {
          const limit = interaction.options.getInteger('cantidad');
          await voiceChannel.setUserLimit(limit);
          
          const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ Límite Actualizado')
            .setDescription(`El límite de usuarios se cambió a: ${limit === 0 ? 'Sin límite' : `${limit} usuarios`}`)
            .setTimestamp();
          
          await interaction.reply({ embeds: [embed], ephemeral: true });
          break;
        }

        case 'nombre': {
          const newName = interaction.options.getString('nuevo-nombre');
          await voiceChannel.setName(newName);
          
          const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ Nombre Actualizado')
            .setDescription(`El canal se renombró a: **${newName}**`)
            .setTimestamp();
          
          await interaction.reply({ embeds: [embed], ephemeral: true });
          break;
        }

        case 'privado': {
          await voiceChannel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            Connect: false,
            ViewChannel: true
          });
          
          const embed = new EmbedBuilder()
            .setColor('#FF9900')
            .setTitle('🔒 Canal Privado')
            .setDescription('Tu canal ahora es privado. Solo tú puedes invitar usuarios.')
            .setTimestamp();
          
          await interaction.reply({ embeds: [embed], ephemeral: true });
          break;
        }

        case 'publico': {
          await voiceChannel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            Connect: true,
            ViewChannel: true
          });
          
          const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🔓 Canal Público')
            .setDescription('Tu canal ahora es público. Cualquiera puede unirse.')
            .setTimestamp();
          
          await interaction.reply({ embeds: [embed], ephemeral: true });
          break;
        }

        case 'kick': {
          const targetUser = interaction.options.getUser('usuario');
          const targetMember = interaction.guild.members.cache.get(targetUser.id);
          
          if (!targetMember || !targetMember.voice.channel || targetMember.voice.channelId !== voiceChannel.id) {
            return interaction.reply({
              content: '❌ Ese usuario no está en tu canal de voz.',
              ephemeral: true
            });
          }

          if (targetMember.id === member.id) {
            return interaction.reply({
              content: '❌ No puedes expulsarte a ti mismo.',
              ephemeral: true
            });
          }

          await targetMember.voice.disconnect('Expulsado por el propietario del canal');
          
          const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('👢 Usuario Expulsado')
            .setDescription(`**${targetUser.tag}** fue expulsado del canal.`)
            .setTimestamp();
          
          await interaction.reply({ embeds: [embed], ephemeral: true });
          break;
        }

        case 'info': {
          const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('📊 Información del Canal Temporal')
            .addFields(
              { name: '📝 Nombre', value: voiceChannel.name, inline: true },
              { name: '👥 Usuarios', value: `${voiceChannel.members.size}/${voiceChannel.userLimit || '∞'}`, inline: true },
              { name: '🔒 Privacidad', value: voiceChannel.permissionsFor(interaction.guild.roles.everyone).has(PermissionFlagsBits.Connect) ? 'Público' : 'Privado', inline: true },
              { name: '🎤 Bitrate', value: `${voiceChannel.bitrate / 1000}kbps`, inline: true },
              { name: '👑 Propietario', value: isOwner ? 'Tú' : 'Otro usuario', inline: true }
            )
            .setTimestamp();
          
          await interaction.reply({ embeds: [embed], ephemeral: true });
          break;
        }
      }
    } catch (error) {
      console.error('Error en comando tempvoice:', error);
      await interaction.reply({
        content: '❌ Ocurrió un error al ejecutar el comando.',
        ephemeral: true
      });
    }
  }
};
