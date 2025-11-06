import { Client, GatewayIntentBits, Collection, Events, ActivityType } from 'discord.js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { Player } from 'discord-player';
import { YoutubeiExtractor } from 'discord-player-youtubei';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Crear cliente de Discord con todos los intents necesarios
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// Inicializar reproductor de música
const player = new Player(client, {
  ytdlOptions: {
    quality: 'highestaudio',
    highWaterMark: 1 << 25
  }
});

// Registrar extractores de música
player.extractors.register(YoutubeiExtractor, {});
player.extractors.loadDefault();

// Colecciones para comandos y cooldowns
client.commands = new Collection();
client.cooldowns = new Collection();

// Cargar configuración
const configPath = join(dirname(__dirname), 'config.json');
const configData = await readFile(configPath, 'utf-8');
client.config = JSON.parse(configData);

// Sistema de datos persistentes
client.data = {
  warnings: new Map(),
  mutes: new Map(),
  tickets: new Map(),
  giveaways: new Map(),
  levels: new Map(),
  
  async load() {
    try {
      const dataPath = join(dirname(__dirname), 'data', 'botdata.json');
      const data = JSON.parse(await readFile(dataPath, 'utf-8'));
      this.warnings = new Map(data.warnings || []);
      this.mutes = new Map(data.mutes || []);
      this.tickets = new Map(data.tickets || []);
      this.giveaways = new Map(data.giveaways || []);
      this.levels = new Map(data.levels || []);
    } catch (error) {
      console.log('No se encontraron datos previos, iniciando con datos limpios');
    }
  },
  
  async save() {
    try {
      const dataPath = join(dirname(__dirname), 'data', 'botdata.json');
      const data = {
        warnings: Array.from(this.warnings.entries()),
        mutes: Array.from(this.mutes.entries()),
        tickets: Array.from(this.tickets.entries()),
        giveaways: Array.from(this.giveaways.entries()),
        levels: Array.from(this.levels.entries())
      };
      await writeFile(dataPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error guardando datos:', error);
    }
  }
};

// Cargar comandos
const commandsPath = join(__dirname, 'commands');
const commandFolders = readdirSync(commandsPath);

for (const folder of commandFolders) {
  const folderPath = join(commandsPath, folder);
  const commandFiles = readdirSync(folderPath).filter(file => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    const filePath = join(folderPath, file);
    const command = await import(`file:///${filePath.replace(/\\/g, '/')}`);
    
    if ('data' in command.default && 'execute' in command.default) {
      client.commands.set(command.default.data.name, command.default);
      console.log(`✅ Comando cargado: ${command.default.data.name}`);
    }
  }
}

// Cargar eventos
const eventsPath = join(__dirname, 'events');
const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = join(eventsPath, file);
  const event = await import(`file:///${filePath.replace(/\\/g, '/')}`);
  
  if (event.default.once) {
    client.once(event.default.name, (...args) => event.default.execute(...args));
  } else {
    client.on(event.default.name, (...args) => event.default.execute(...args));
  }
  console.log(`✅ Evento cargado: ${event.default.name}`);
}

// Cargar datos persistentes
await client.data.load();

// Guardar datos cada 5 minutos
setInterval(() => {
  client.data.save();
}, 5 * 60 * 1000);

// Manejar errores
process.on('unhandledRejection', error => {
  console.error('Error no manejado:', error);
});

// Login
client.login(process.env.DISCORD_TOKEN);
