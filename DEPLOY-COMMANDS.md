# 🚀 Desplegar Comandos de Discord

## ⚠️ IMPORTANTE

Los comandos de slash (/) **NO aparecen automáticamente** en Discord. Debes registrarlos manualmente usando el script de despliegue.

## 📋 ¿Cuándo Necesitas Desplegar Comandos?

Debes ejecutar el script de despliegue en estas situaciones:

- ✅ **Primera vez** que instalas el bot
- ✅ Cuando **agregas nuevos comandos**
- ✅ Cuando **modificas comandos existentes** (nombre, descripción, opciones)
- ✅ Cuando **invitas el bot a un nuevo servidor**

## 🔧 Cómo Desplegar Comandos

### Paso 1: Asegúrate de tener el archivo .env configurado

Tu archivo `.env` debe tener:
```env
DISCORD_TOKEN=tu_token_aqui
CLIENT_ID=tu_client_id_aqui
```

### Paso 2: Ejecutar el script de despliegue

```bash
npm run deploy
```

O directamente:
```bash
node deploy-commands.js
```

### Paso 3: Esperar confirmación

Verás algo como:
```
✅ Comando cargado: ban
✅ Comando cargado: kick
✅ Comando cargado: warn
...
🚀 Iniciando despliegue de 39 comandos...
✅ 39 comandos desplegados exitosamente!
```

### Paso 4: Verificar en Discord

1. Ve a tu servidor de Discord
2. Escribe `/` en cualquier canal
3. Deberías ver TODOS los comandos del bot

## ⏱️ Tiempo de Propagación

- **Comandos globales**: Pueden tardar hasta **1 hora** en aparecer
- **Comandos de servidor**: Aparecen **instantáneamente**

## 🔄 Si los Comandos No Aparecen

1. **Espera 5-10 minutos** (Discord puede tardar en actualizar)
2. **Recarga Discord** (Ctrl + R en PC, Cmd + R en Mac)
3. **Verifica los permisos del bot**:
   - El bot necesita el permiso `applications.commands`
   - Reinvita el bot con la URL correcta si es necesario

## 🛠️ Solución de Problemas

### Error: "Invalid token"
- Verifica que `DISCORD_TOKEN` en `.env` sea correcto
- El token debe empezar con algo como `MTI...`

### Error: "Missing Access"
- Verifica que `CLIENT_ID` en `.env` sea correcto
- Es el ID de la aplicación (no el ID del bot)

### Los comandos aparecen pero no funcionan
- Asegúrate de que el bot esté **en línea**
- Verifica que el bot tenga los **permisos necesarios** en el servidor

## 📝 Comandos Disponibles

Después del despliegue, tendrás acceso a:

### 🛡️ Moderación (9 comandos)
- `/ban`, `/kick`, `/timeout`, `/warn`, `/warnings`, `/clearwarnings`, `/clear`, `/unban`, `/untimeout`

### 🎵 Música (7 comandos)
- `/play`, `/pause`, `/resume`, `/skip`, `/stop`, `/queue`, `/nowplaying`

### 📊 Niveles (4 comandos)
- `/rank`, `/leaderboard`, `/setlevel`, `/resetlevels`

### 🎉 Sorteos (3 comandos)
- `/giveaway-start`, `/giveaway-end`, `/giveaway-reroll`

### 🎫 Tickets (3 comandos)
- `/ticket-setup`, `/ticket-close`, `/ticket-add`

### 🛡️ Anti-Raid (5 comandos)
- `/antiraid`, `/antispam`, `/lockdown`, `/nuke`, `/massban`

### 💾 Backups (1 comando)
- `/backup-create`

### 🤖 IA (4 comandos)
- `/kb-add`, `/kb-remove`, `/kb-list`, `/kb-reload`

### 🎮 Diversión (6 comandos)
- `/ping`, `/8ball`, `/coinflip`, `/dice`, `/meme`, `/say`

### 📊 Sistema (1 comando)
- `/history`

**Total: ~39 comandos**

## 💡 Tip

Si solo quieres probar comandos en un servidor específico (más rápido), puedes modificar el script para usar comandos de servidor en lugar de globales. Pero para producción, se recomienda usar comandos globales.
