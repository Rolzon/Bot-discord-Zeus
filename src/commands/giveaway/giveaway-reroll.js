import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('giveaway-reroll')
    .setDescription('Vuelve a sortear los ganadores')
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
    
    if (!giveawayData.ended) {
      return interaction.reply({ content: '❌ Este sorteo aún no ha terminado.', ephemeral: true });
    }
    
    await interaction.deferReply();
    
    try {
      const channel = interaction.guild.channels.cache.get(giveawayData.channelId);
      const message = await channel.messages.fetch(messageId);
      
      const reaction = message.reactions.cache.get('🎉');
      const users = await reaction.users.fetch();
      const participants = users.filter(user => !user.bot);
      
      if (participants.size === 0) {
        return interaction.editReply({ content: '❌ No hay participantes para volver a sortear.' });
      }
      
      const winnersArray = participants.random(Math.min(giveawayData.winners, participants.size));
      const winnersList = Array.isArray(winnersArray) ? winnersArray : [winnersArray];
      
      await interaction.editReply(`🎉 **Nuevos ganadores:**\n${winnersList.join(', ')}\n¡Felicidades por ganar **${giveawayData.prize}**!`);
      
    } catch (error) {
      console.error('Error en reroll:', error);
      await interaction.editReply({ content: '❌ Error al volver a sortear.' });
    }
  }
};
