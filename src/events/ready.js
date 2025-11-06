import { Events, ActivityType } from 'discord.js';

export default {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`\n🤖 Bot conectado como ${client.user.tag}`);
    console.log(`📊 Sirviendo a ${client.guilds.cache.size} servidores`);
    console.log(`👥 Usuarios totales: ${client.users.cache.size}`);
    console.log(`⚡ Bot listo para usar!\n`);
    
    // Establecer estado del bot
    const activities = [
      { name: 'tu servidor', type: ActivityType.Watching },
      { name: 'usa !ayuda', type: ActivityType.Playing },
      { name: 'la comunidad', type: ActivityType.Listening },
      { name: 'con GPT-3.5', type: ActivityType.Playing }
    ];
    
    let currentActivity = 0;
    
    const updateActivity = () => {
      client.user.setPresence({
        activities: [activities[currentActivity]],
        status: 'online'
      });
      currentActivity = (currentActivity + 1) % activities.length;
    };
    
    updateActivity();
    setInterval(updateActivity, 30000); // Cambiar cada 30 segundos
  }
};
