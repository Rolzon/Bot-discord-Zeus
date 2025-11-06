import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  data: new SlashCommandBuilder()
    .setName('backup-create')
    .setDescription('Crea un backup completo del servidor')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    try {
      const guild = interaction.guild;
      
      // Recopilar información del servidor
      const backup = {
        name: guild.name,
        icon: guild.iconURL({ size: 1024 }),
        banner: guild.bannerURL({ size: 1024 }),
        description: guild.description,
        verificationLevel: guild.verificationLevel,
        defaultMessageNotifications: guild.defaultMessageNotifications,
        explicitContentFilter: guild.explicitContentFilter,
        afkTimeout: guild.afkTimeout,
        afkChannelId: guild.afkChannelId,
        systemChannelId: guild.systemChannelId,
        createdAt: guild.createdTimestamp,
        backupDate: Date.now(),
        
        roles: [],
        channels: [],
        emojis: []
      };
      
      // Guardar roles
      guild.roles.cache.forEach(role => {
        if (role.id !== guild.id) { // Ignorar @everyone
          backup.roles.push({
            name: role.name,
            color: role.color,
            hoist: role.hoist,
            position: role.position,
            permissions: role.permissions.bitfield.toString(),
            mentionable: role.mentionable
          });
        }
      });
      
      // Guardar canales
      guild.channels.cache.forEach(channel => {
        const channelData = {
          name: channel.name,
          type: channel.type,
          position: channel.position,
          parentId: channel.parentId
        };
        
        if (channel.isTextBased()) {
          channelData.topic = channel.topic;
          channelData.nsfw = channel.nsfw;
          channelData.rateLimitPerUser = channel.rateLimitPerUser;
        }
        
        if (channel.isVoiceBased()) {
          channelData.bitrate = channel.bitrate;
          channelData.userLimit = channel.userLimit;
        }
        
        backup.channels.push(channelData);
      });
      
      // Guardar emojis
      guild.emojis.cache.forEach(emoji => {
        backup.emojis.push({
          name: emoji.name,
          url: emoji.url
        });
      });
      
      // Guardar backup en archivo
      const backupPath = join(dirname(dirname(dirname(__dirname))), 'data', `backup-${guild.id}-${Date.now()}.json`);
      await writeFile(backupPath, JSON.stringify(backup, null, 2));
      
      await interaction.editReply({
        content: `✅ Backup creado exitosamente!\n\n` +
          `**Información guardada:**\n` +
          `• ${backup.roles.length} roles\n` +
          `• ${backup.channels.length} canales\n` +
          `• ${backup.emojis.length} emojis\n\n` +
          `Archivo: \`${backupPath}\``
      });
      
    } catch (error) {
      console.error('Error creando backup:', error);
      await interaction.editReply({ content: '❌ Error al crear el backup.' });
    }
  }
};
