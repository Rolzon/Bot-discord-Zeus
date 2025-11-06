import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const commands = [];
const commandsPath = join(__dirname, 'commands');
const commandFolders = readdirSync(commandsPath);

// Cargar todos los comandos
for (const folder of commandFolders) {
  const folderPath = join(commandsPath, folder);
  const commandFiles = readdirSync(folderPath).filter(file => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    const filePath = join(folderPath, file);
    const command = await import(`file:///${filePath.replace(/\\/g, '/')}`);
    
    if ('data' in command.default && 'execute' in command.default) {
      commands.push(command.default.data.toJSON());
      console.log(`✅ Comando cargado: ${command.default.data.name}`);
    }
  }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Desplegar comandos
(async () => {
  try {
    console.log(`\n🚀 Desplegando ${commands.length} comandos...`);
    
    // Desplegar comandos globalmente
    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    
    console.log(`✅ ${data.length} comandos desplegados exitosamente!\n`);
    
  } catch (error) {
    console.error('❌ Error desplegando comandos:', error);
  }
})();
