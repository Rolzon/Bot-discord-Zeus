# 🤖 Super Bot de Discord con IA - Estilo Drako Bot

Un bot **multi-propósito** completo de Discord con integración de GPT-3.5-turbo, música, tickets, sorteos, sistema de niveles, backups y protección anti-raid. Inspirado en Drako Bot con todas las funciones profesionales.

## ✨ Características Principales

### 🛡️ Moderación Avanzada
- **Kick/Ban/Unban** - Gestión completa de usuarios
- **Sistema de Advertencias** - Advertencias con expulsión automática
- **Timeout** - Silenciamiento temporal de usuarios
- **Clear** - Eliminación masiva de mensajes
- **Mass Ban** - Baneo masivo de usuarios por ID
- **Auto-moderación** - Detección automática de spam y contenido inapropiado

### 🎵 Sistema de Música
- **Reproducción desde YouTube/Spotify** - Soporte multi-plataforma
- **Cola de reproducción** - Gestión completa de canciones
- **Controles completos** - Play, pause, skip, stop, volume
- **Now Playing** - Información detallada de la canción actual
- **Calidad de audio alta** - Mejor experiencia de escucha

### 🎫 Sistema de Tickets
- **Panel de tickets con botones** - Interfaz moderna
- **Transcripciones automáticas** - Guarda historial de conversaciones
- **Gestión de permisos** - Añade/quita usuarios de tickets
- **Cierre automático** - Con logs completos
- **Categorías personalizables** - Organiza tus tickets

### 🎉 Sistema de Sorteos (Giveaways)
- **Sorteos automáticos** - Configuración completa
- **Múltiples ganadores** - Hasta 20 ganadores por sorteo
- **Reroll** - Vuelve a sortear ganadores
- **Finalización anticipada** - Control total
- **Embeds atractivos** - Diseño profesional

### 📊 Sistema de Niveles y XP
- **XP por mensajes** - Sistema de progresión automático
- **Ranking global** - Leaderboard del servidor
- **Mensajes de nivel** - Notificaciones al subir de nivel
- **Comandos de gestión** - Setlevel, resetlevels
- **Cooldown anti-spam** - Sistema justo de XP

### 💾 Sistema de Backups
- **Backup completo del servidor** - Roles, canales, emojis
- **Guardado automático** - Archivos JSON
- **Información detallada** - Toda la configuración del servidor
- **Fácil restauración** - Sistema de recuperación

### 🛡️ Protección Anti-Raid
- **Modo Anti-Raid** - Protección contra ataques masivos
- **Lockdown** - Bloquea todos los canales instantáneamente
- **Anti-Spam** - Detección y acción automática
- **Nuke** - Limpieza total de canales
- **Detección de raids** - Alertas automáticas

### 🤖 Inteligencia Artificial (GPT-3.5) ⭐ NUEVO
- **Chat con GPT-3.5-turbo** - Menciona al bot para conversar
- **Base de Conocimiento Personalizada** - Añade FAQs de tu negocio
- **Respuestas Naturales Inteligentes** - El bot responde usando tu información
- **Detección de Palabras Clave** - Identifica preguntas automáticamente
- **Historial de conversaciones** - Mantiene contexto por canal
- **Gestión de FAQs** - Comandos para añadir/editar/eliminar respuestas
- **Límites configurables** - Control de tokens y temperatura

### 🔧 Utilidades
- **Encuestas** - Crea polls interactivas con reacciones
- **Anuncios** - Sistema de anuncios con embeds personalizados
- **Gestión de Roles** - Añade/quita roles fácilmente
- **Información** - Comandos de info de servidor y usuarios
- **Avatar** - Muestra avatares en alta calidad

### 🎮 Diversión
- **8ball** - Bola 8 mágica
- **Dados** - Lanza dados personalizables
- **Moneda** - Cara o cruz
- **Memes** - Memes aleatorios de Reddit
- **Ping** - Latencia del bot

### 📊 Sistema de Logs Completo
- Mensajes eliminados y editados
- Miembros que entran y salen
- Acciones de moderación
- Tickets cerrados con transcripciones
- Canal de logs personalizable

### 🎉 Sistema de Bienvenida
- Mensajes de bienvenida con embeds
- DM automático a nuevos miembros
- Información del servidor
- Contador de miembros

## 📋 Requisitos

- Node.js 18.0.0 o superior
- Una cuenta de Discord
- Token de bot de Discord
- API Key de OpenAI
- FFmpeg (para música)
- 512MB RAM mínimo (1GB recomendado)

## 🚀 Instalación

### 1. Clonar o descargar el proyecto

```bash
cd discord-super-bot
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar el bot

#### Crear aplicación en Discord:
1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Crea una nueva aplicación
3. Ve a la sección "Bot" y crea un bot
4. Copia el token del bot
5. Habilita los siguientes **Privileged Gateway Intents**:
   - ✅ PRESENCE INTENT
   - ✅ SERVER MEMBERS INTENT
   - ✅ MESSAGE CONTENT INTENT
6. Ve a OAuth2 > URL Generator
7. Selecciona los scopes: `bot` y `applications.commands`
8. Selecciona los permisos necesarios (o Administrator para simplicidad)
9. Usa la URL generada para invitar el bot a tu servidor

#### Obtener API Key de OpenAI:
1. Ve a [OpenAI Platform](https://platform.openai.com/api-keys)
2. Crea una cuenta o inicia sesión
3. Crea una nueva API key
4. Copia la key (¡guárdala en un lugar seguro!)

#### Configurar variables de entorno:
1. Copia el archivo `.env.example` a `.env`:
   ```bash
   copy .env.example .env
   ```

2. Edita el archivo `.env` con tus credenciales:
   ```env
   DISCORD_TOKEN=tu_token_aqui
   OPENAI_API_KEY=tu_api_key_aqui
   CLIENT_ID=tu_client_id_aqui
   ```

### 4. Configurar el bot (opcional)

Edita `config.json` para personalizar:
- Prefix de comandos (si usas comandos de texto)
- Color de los embeds
- Roles de moderador
- Nombres de canales (logs, bienvenida, reglas)
- Máximo de advertencias
- Configuración de GPT (modelo, temperatura, tokens)

### 5. Desplegar comandos slash

```bash
node src/deploy-commands.js
```

### 6. Iniciar el bot

```bash
npm start
```

O en modo desarrollo (con auto-reload):
```bash
npm run dev
```

## 📝 Comandos Disponibles (60+ Comandos)

### 🛡️ Moderación
| Comando | Descripción | Permisos |
|---------|-------------|----------|
| `/kick` | Expulsa a un usuario | Kick Members |
| `/ban` | Banea a un usuario | Ban Members |
| `/unban` | Desbanea a un usuario | Ban Members |
| `/warn` | Advierte a un usuario | Moderate Members |
| `/warnings` | Ver advertencias de un usuario | Moderate Members |
| `/clearwarnings` | Limpia advertencias | Administrator |
| `/timeout` | Silencia temporalmente | Moderate Members |
| `/untimeout` | Quita el timeout | Moderate Members |
| `/clear` | Elimina mensajes | Manage Messages |

### 🎵 Música
| Comando | Descripción |
|---------|-------------|
| `/play` | Reproduce música desde YouTube/Spotify |
| `/pause` | Pausa la música actual |
| `/resume` | Reanuda la música |
| `/skip` | Salta a la siguiente canción |
| `/stop` | Detiene la música y limpia la cola |
| `/queue` | Muestra la cola de reproducción |
| `/volume` | Ajusta el volumen (0-100) |
| `/nowplaying` | Muestra la canción actual |

### 🎫 Tickets
| Comando | Descripción | Permisos |
|---------|-------------|----------|
| `/ticket-setup` | Configura el sistema de tickets | Administrator |
| `/ticket-close` | Cierra el ticket actual | - |
| `/ticket-add` | Añade un usuario al ticket | Manage Channels |
| `/ticket-remove` | Quita un usuario del ticket | Manage Channels |

### 🎉 Sorteos (Giveaways)
| Comando | Descripción | Permisos |
|---------|-------------|----------|
| `/giveaway-start` | Inicia un sorteo | Manage Guild |
| `/giveaway-end` | Termina un sorteo anticipadamente | Manage Guild |
| `/giveaway-reroll` | Vuelve a sortear ganadores | Manage Guild |

### 📊 Niveles y XP
| Comando | Descripción | Permisos |
|---------|-------------|----------|
| `/rank` | Muestra tu nivel y XP | - |
| `/leaderboard` | Ranking de niveles del servidor | - |
| `/setlevel` | Establece el nivel de un usuario | Administrator |
| `/resetlevels` | Reinicia todos los niveles | Administrator |

### 💾 Backups
| Comando | Descripción | Permisos |
|---------|-------------|----------|
| `/backup-create` | Crea un backup del servidor | Administrator |

### 🛡️ Anti-Raid y Protección
| Comando | Descripción | Permisos |
|---------|-------------|----------|
| `/antiraid` | Activa/desactiva modo anti-raid | Administrator |
| `/lockdown` | Bloquea todos los canales | Administrator |
| `/antispam` | Configura el sistema anti-spam | Manage Guild |
| `/nuke` | Clona y elimina el canal actual | Manage Channels |
| `/massban` | Banea múltiples usuarios por ID | Ban Members |

### 🔧 Utilidad
| Comando | Descripción |
|---------|-------------|
| `/poll` | Crea una encuesta |
| `/announce` | Envía un anuncio |
| `/role` | Gestiona roles de usuarios |
| `/serverinfo` | Información del servidor |
| `/userinfo` | Información de un usuario |
| `/avatar` | Muestra el avatar |
| `/help` | Lista de comandos |
| `/ping` | Latencia del bot |

### 🎮 Diversión
| Comando | Descripción |
|---------|-------------|
| `/8ball` | Pregunta a la bola 8 |
| `/dice` | Lanza dados |
| `/coinflip` | Lanza una moneda |
| `/meme` | Meme aleatorio |
| `/say` | Haz que el bot diga algo |

### 🤖 IA (GPT-3.5) y Base de Conocimiento
Para hablar con la IA, simplemente menciona al bot:
```
@BotName ¿Cómo estás?
@BotName Cuéntame un chiste
@BotName ¿Qué opinas sobre...?
@BotName Ayúdame con este problema
```

**Gestión de Base de Conocimiento:**
| Comando | Descripción | Permisos |
|---------|-------------|----------|
| `/kb-add` | Añade una FAQ personalizada | Administrator |
| `/kb-list` | Lista todas las FAQs | Administrator |
| `/kb-remove` | Elimina una FAQ | Administrator |
| `/kb-reload` | Recarga la base de conocimiento | Administrator |

**Ejemplo de uso:**
```
/kb-add 
palabras-clave: precio,costo,cuanto
respuesta: Nuestros planes empiezan desde $5/mes. Visita nuestra web para más info.
```

El bot detectará automáticamente estas palabras y responderá de manera natural usando GPT-3.5.

## ⚙️ Configuración del Servidor

### Canales Recomendados
Para aprovechar todas las funciones, crea estos canales:
- `#bienvenida` - Para mensajes de bienvenida
- `#logs` - Para logs del sistema
- `#reglas` - Para las reglas del servidor

### Roles Recomendados
- `Administrador` - Acceso completo
- `Moderador` - Comandos de moderación
- `Miembro` - Rol básico

## 🔧 Personalización

### Modificar el comportamiento de la IA
Edita `config.json`:
```json
{
  "gptSystemPrompt": "Tu prompt personalizado aquí",
  "gptTemperature": 0.8,
  "gptMaxTokens": 500
}
```

### Añadir comandos personalizados
1. Crea un nuevo archivo en `src/commands/[categoria]/`
2. Usa esta plantilla:
```javascript
import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('nombre')
    .setDescription('descripción'),
  
  async execute(interaction) {
    await interaction.reply('¡Hola!');
  }
};
```
3. Redespliega los comandos: `node src/deploy-commands.js`

## 🛠️ Solución de Problemas

### El bot no responde a comandos
- Verifica que los comandos estén desplegados: `node src/deploy-commands.js`
- Asegúrate de que el bot tenga los permisos necesarios
- Verifica que los intents estén habilitados en el Developer Portal

### La IA no funciona
- Verifica tu API key de OpenAI
- Asegúrate de tener créditos en tu cuenta de OpenAI
- Revisa los logs para ver errores específicos

### Errores de permisos
- El bot necesita permisos de Administrator o permisos específicos
- Asegúrate de que el rol del bot esté por encima de los roles que intenta gestionar

### El bot se desconecta
- Verifica tu conexión a internet
- Revisa los logs para errores
- Asegúrate de que el token sea válido

## 📊 Estructura del Proyecto

```
discord-super-bot/
├── src/
│   ├── commands/
│   │   ├── moderation/    # Comandos de moderación
│   │   ├── utility/       # Comandos de utilidad
│   │   └── fun/          # Comandos de diversión
│   ├── events/           # Eventos del bot
│   ├── index.js          # Archivo principal
│   └── deploy-commands.js # Script de despliegue
├── data/                 # Datos persistentes
├── config.json          # Configuración del bot
├── .env                 # Variables de entorno
├── package.json         # Dependencias
└── README.md           # Este archivo
```

## 🔒 Seguridad

- ⚠️ **NUNCA** compartas tu token de Discord o API key de OpenAI
- No subas el archivo `.env` a repositorios públicos
- Usa `.gitignore` para excluir archivos sensibles
- Revisa regularmente los permisos del bot

## 📈 Próximas Características

- [ ] Sistema de economía
- [ ] Sistema de niveles y XP
- [ ] Comandos de música
- [ ] Sistema de tickets
- [ ] Dashboard web
- [ ] Base de datos (MongoDB/PostgreSQL)
- [ ] Comandos personalizados por servidor

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si encuentras un bug o tienes una sugerencia:
1. Reporta el issue
2. Crea un fork del proyecto
3. Haz tus cambios
4. Envía un pull request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 💡 Soporte

Si necesitas ayuda:
- Revisa la documentación de [Discord.js](https://discord.js.org/)
- Consulta la [API de OpenAI](https://platform.openai.com/docs/)
- Abre un issue en el repositorio

## 🙏 Créditos

- [Discord.js](https://discord.js.org/) - Librería de Discord
- [OpenAI](https://openai.com/) - API de GPT-3.5-turbo
- [Node.js](https://nodejs.org/) - Runtime de JavaScript

---

**¡Disfruta tu bot de Discord! 🎉**
