import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('giveaway-end')
    .setDescription('Termina un sorteo anticipadamente')
    .addStringOption(option =>
      option.setName('messageid')
        .setDescription('ID del mensaje del sorteo')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  
  async execute(interaction) {
    const messageId = interaction.options.getString('messageid');
    const giveawayData = interaction.client.data.giveaways.get(messageId);
    
    if (!giveawayData) {
      return interaction.reply({ content: '❌ No se encontró un sorteo con ese ID.', ephemeral: true });
    }
    
    if (giveawayData.ended) {
      return interaction.reply({ content: '❌ Este sorteo ya ha terminado.', ephemeral: true });
    }
    
    await interaction.deferReply({ ephemeral: true });
    
    try {
      const channel = interaction.guild.channels.cache.get(giveawayData.channelId);
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
          .setFooter({ text: 'Sorteo terminado anticipadamente' })
          .setTimestamp();
        
        await message.edit({ embeds: [embed] });
        giveawayData.ended = true;
        await interaction.client.data.save();
        return interaction.editReply({ content: '✅ Sorteo terminado (sin participantes).' });
      }
      
      const winnersArray = participants.random(Math.min(giveawayData.winners, participants.size));
      const winnersList = Array.isArray(winnersArray) ? winnersArray : [winnersArray];
      
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🎉 SORTEO TERMINADO 🎉')
        .setDescription(`**Premio:** ${giveawayData.prize}\n\n` +
          `**Ganador(es):**\n${winnersList.map(w => `• ${w}`).join('\n')}`)
        .setFooter({ text: 'Sorteo terminado anticipadamente' })
        .setTimestamp();
      
      await message.edit({ embeds: [embed] });
      await channel.send(`🎉 ¡Felicidades ${winnersList.join(', ')}! Ganaste **${giveawayData.prize}**!`);
      
      giveawayData.ended = true;
      giveawayData.winners = winnersList.map(w => w.id);
      await interaction.client.data.save();
      
      await interaction.editReply({ content: '✅ Sorteo terminado exitosamente.' });
      
    } catch (error) {
      console.error('Error terminando sorteo:', error);
      await interaction.editReply({ content: '❌ Error al terminar el sorteo.' });
    }
  }
};
