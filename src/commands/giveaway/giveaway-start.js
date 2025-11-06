import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import ms from 'ms';

export default {
  data: new SlashCommandBuilder()
    .setName('giveaway-start')
    .setDescription('Inicia un sorteo')
    .addStringOption(option =>
      option.setName('duracion')
        .setDescription('Duración del sorteo (ej: 1h, 1d, 1w)')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('ganadores')
        .setDescription('Número de ganadores')
        .setMinValue(1)
        .setMaxValue(20)
        .setRequired(true))
    .addStringOption(option =>
      option.setName('premio')
        .setDescription('Premio del sorteo')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('canal')
        .setDescription('Canal donde se realizará el sorteo')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  
  async execute(interaction) {
    const duration = interaction.options.getString('duracion');
    const winners = interaction.options.getInteger('ganadores');
    const prize = interaction.options.getString('premio');
    const channel = interaction.options.getChannel('canal') || interaction.channel;
    
    const timeMs = ms(duration);
    
    if (!timeMs || timeMs < 1000) {
      return interaction.reply({ content: '❌ Duración inválida. Usa formatos como: 1h, 1d, 1w', ephemeral: true });
    }
    
    const endTime = Date.now() + timeMs;
    
    const embed = new EmbedBuilder()
      .setColor(interaction.client.config.embedColor)
      .setTitle('🎉 SORTEO 🎉')
      .setDescription(`**Premio:** ${prize}\n\n` +
        `**Ganadores:** ${winners}\n` +
        `**Termina:** <t:${Math.floor(endTime / 1000)}:R>\n` +
        `**Organizado por:** ${interaction.user}\n\n` +
        `Reacciona con 🎉 para participar!`)
      .setFooter({ text: `${winners} ganador(es) | Termina` })
      .setTimestamp(endTime);
    
    try {
      const message = await channel.send({ embeds: [embed] });
      await message.react('🎉');
      
      // Guardar sorteo
      const giveawayData = {
        messageId: message.id,
        channelId: channel.id,
        guildId: interaction.guildId,
        prize: prize,
        winners: winners,
        endTime: endTime,
        hostId: interaction.user.id,
        ended: false
      };
      
      interaction.client.data.giveaways.set(message.id, giveawayData);
      await interaction.client.data.save();
      
      // Programar finalización
      setTimeout(async () => {
        await endGiveaway(interaction.client, message.id);
      }, timeMs);
      
      await interaction.reply({ content: `✅ Sorteo iniciado en ${channel}`, ephemeral: true });
      
    } catch (error) {
      console.error('Error iniciando sorteo:', error);
      await interaction.reply({ content: '❌ Error al iniciar el sorteo.', ephemeral: true });
    }
  }
};

async function endGiveaway(client, messageId) {
  const giveawayData = client.data.giveaways.get(messageId);
  
  if (!giveawayData || giveawayData.ended) return;
  
  try {
    const guild = client.guilds.cache.get(giveawayData.guildId);
    const channel = guild.channels.cache.get(giveawayData.channelId);
    const message = await channel.messages.fetch(messageId);
    
    const reaction = message.reactions.cache.get('🎉');
    const users = await reaction.users.fetch();
    const participants = users.filter(user => !user.bot);
    
    if (participants.size === 0) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🎉 SORTEO TERMINADO 🎉')
        .setDescription(`**Premio:** ${giveawayData.prize}\n\n` +
          `No hubo participantes válidos.`)
        .setFooter({ text: 'Sorteo terminado' })
        .setTimestamp();
      
      await message.edit({ embeds: [embed] });
      giveawayData.ended = true;
      await client.data.save();
      return;
    }
    
    const winnersArray = participants.random(Math.min(giveawayData.winners, participants.size));
    const winnersList = Array.isArray(winnersArray) ? winnersArray : [winnersArray];
    
    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('🎉 SORTEO TERMINADO 🎉')
      .setDescription(`**Premio:** ${giveawayData.prize}\n\n` +
        `**Ganador(es):**\n${winnersList.map(w => `• ${w}`).join('\n')}`)
      .setFooter({ text: 'Sorteo terminado' })
      .setTimestamp();
    
    await message.edit({ embeds: [embed] });
    await channel.send(`🎉 ¡Felicidades ${winnersList.join(', ')}! Ganaste **${giveawayData.prize}**!`);
    
    giveawayData.ended = true;
    giveawayData.winners = winnersList.map(w => w.id);
    await client.data.save();
    
  } catch (error) {
    console.error('Error finalizando sorteo:', error);
  }
}
