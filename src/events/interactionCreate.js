import { Events } from 'discord.js';

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;
    
    const command = interaction.client.commands.get(interaction.commandName);
    
    if (!command) {
      console.error(`Comando ${interaction.commandName} no encontrado`);
      return;
    }
    
    // Sistema de cooldown
    const { cooldowns } = interaction.client;
    
    if (!cooldowns.has(command.data.name)) {
      cooldowns.set(command.data.name, new Map());
    }
    
    const now = Date.now();
    const timestamps = cooldowns.get(command.data.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;
    
    if (timestamps.has(interaction.user.id)) {
      const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
      
      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return interaction.reply({
          content: `⏳ Por favor espera ${timeLeft.toFixed(1)} segundos antes de usar \`${command.data.name}\` de nuevo.`,
          ephemeral: true
        });
      }
    }
    
    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
    
    // Ejecutar comando
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Error ejecutando ${interaction.commandName}:`, error);
      
      const errorMessage = {
        content: '❌ Hubo un error al ejecutar este comando.',
        ephemeral: true
      };
      
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage);
      } else {
        await interaction.reply(errorMessage);
      }
    }
  }
};
