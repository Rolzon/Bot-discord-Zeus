import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const commands = [];

// Cargar todos los comandos
const commandsPath = join(__dirname, 'src', 'commands');
const commandFolders = readdirSync(commandsPath);

for (const folder of commandFolders) {
  const folderPath = join(commandsPath, folder);
  const commandFiles = readdirSync(folderPath).filter(file => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    const filePath = join(folderPath, file);
    const command = await import(`file:///${filePath.replace(/\\/g, '/')}`);
    
    if ('data' in command.default && 'execute' in command.default) {
      commands.push(command.default.data.toJSON());
      console.log(`✅ Comando cargado: ${command.default.data.name}`);
    } else {
      console.log(`⚠️ Comando sin data o execute: ${file}`);
    }
  }
}

// Construir y preparar una instancia del módulo REST
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Desplegar comandos
(async () => {
  try {
    console.log(`\n🚀 Iniciando despliegue de ${commands.length} comandos...`);

    // Registrar comandos globalmente (disponibles en todos los servidores)
    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );

    console.log(`✅ ${data.length} comandos desplegados exitosamente!`);
    console.log('\n📋 Comandos registrados:');
    data.forEach(cmd => console.log(`   - /${cmd.name}`));
    
  } catch (error) {
    console.error('❌ Error desplegando comandos:', error);
  }
})();
