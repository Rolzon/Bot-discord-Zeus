# 🌐 Dashboard Web - Guía de Instalación

## 📋 ¿Qué es el Dashboard Web?

El Dashboard Web es una **interfaz gráfica completa** para administrar tu bot de Discord Zeus System desde el navegador. Incluye:

- ✅ **Autenticación Discord OAuth2** - Login seguro con Discord
- ✅ **Panel de administración completo** - Gestión de todas las funciones del bot
- ✅ **Dashboard de tickets especializado** - Gestión visual de tickets en tiempo real
- ✅ **Estadísticas en tiempo real** - Socket.IO para actualizaciones instantáneas
- ✅ **Interfaz moderna y responsive** - Bootstrap 5 + diseño profesional
- ✅ **API REST completa** - Endpoints para todas las funciones

## 🚀 Instalación y Configuración

### Paso 1: Instalar Dependencias

En tu servidor, dentro de la carpeta del bot:

```bash
npm install
```

Las nuevas dependencias incluyen:
- `express` - Servidor web
- `passport-discord` - Autenticación OAuth2
- `socket.io` - Tiempo real
- `ejs` - Motor de plantillas
- `helmet` - Seguridad

### Paso 2: Configurar Discord OAuth2

1. **Ve a Discord Developer Portal**: https://discord.com/developers/applications
2. **Selecciona tu aplicación** (la misma del bot)
3. **Ve a OAuth2 > General**:
   - Añade redirect URL: `http://tu-dominio.com:3000/auth/discord/callback`
   - Para desarrollo local: `http://localhost:3000/auth/discord/callback`
4. **Copia el Client Secret** (diferente al token del bot)

### Paso 3: Configurar Variables de Entorno

Edita tu archivo `.env` y añade:

```env
# Configuración del Dashboard (NUEVAS VARIABLES)
CLIENT_SECRET=tu_client_secret_de_oauth2
CALLBACK_URL=http://localhost:3000/auth/discord/callback
SESSION_SECRET=una_clave_secreta_aleatoria_muy_larga
DASHBOARD_PORT=3000
DASHBOARD_URL=http://localhost:3000

# Variables existentes del bot
DISCORD_TOKEN=tu_token_del_bot
CLIENT_ID=tu_client_id
OPENAI_API_KEY=tu_api_key
MONGODB_URI=tu_mongodb_uri
```

**Importante**: 
- `CLIENT_SECRET` ≠ `DISCORD_TOKEN` (son diferentes)
- `SESSION_SECRET` debe ser una cadena aleatoria larga y única

### Paso 4: Iniciar el Dashboard

Tienes varias opciones:

#### Opción A: Bot + Dashboard juntos
```bash
npm run start-all
```

#### Opción B: Solo Dashboard
```bash
npm run dashboard
```

#### Opción C: Por separado
```bash
# Terminal 1: Bot
npm start

# Terminal 2: Dashboard
npm run dashboard
```

### Paso 5: Acceder al Dashboard

1. **Abre tu navegador** en: `http://localhost:3000`
2. **Haz clic en "Iniciar Sesión con Discord"**
3. **Autoriza la aplicación** en Discord
4. **¡Listo!** Ya puedes administrar tus servidores

## 🔧 Configuración para Producción

### Usar un Dominio Real

1. **Configura tu dominio** (ej: `dashboard.tubot.com`)
2. **Actualiza las variables**:
   ```env
   CALLBACK_URL=https://dashboard.tubot.com/auth/discord/callback
   DASHBOARD_URL=https://dashboard.tubot.com
   DASHBOARD_PORT=3000
   ```
3. **Actualiza Discord OAuth2** con la nueva URL

### Usar HTTPS (Recomendado)

```bash
# Con nginx como proxy reverso
server {
    listen 80;
    server_name dashboard.tubot.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Usar PM2 para Producción

```bash
# Crear archivo ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'zeus-bot',
      script: 'index.js',
      cwd: '/ruta/a/tu/bot',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'zeus-dashboard',
      script: 'dashboard/server.js',
      cwd: '/ruta/a/tu/bot',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};

# Iniciar con PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 📊 Funciones del Dashboard

### 🏠 Dashboard Principal
- **Resumen de servidores** donde tienes permisos de admin
- **Estadísticas del bot** en tiempo real
- **Selección de servidor** para administrar

### 🛡️ Panel de Moderación
- **Gestión de miembros** - kick, ban, timeout, roles
- **Logs de moderación** - historial de acciones
- **Configuración de auto-moderación**

### 🎫 Dashboard de Tickets
- **Vista de todos los tickets** - abiertos y cerrados
- **Gestión individual** - ver, cerrar, reabrir, eliminar
- **Estadísticas detalladas** - tickets por día, tiempo promedio
- **Tiempo real** - actualizaciones instantáneas con Socket.IO
- **Filtros avanzados** - por estado, categoría, fecha

### 🎵 Panel de Música
- **Cola de reproducción actual**
- **Controles remotos** - play, pause, skip, stop
- **Historial de canciones**

### 🏆 Sistema de Niveles
- **Leaderboard visual** - ranking de usuarios
- **Gestión de XP** - añadir/quitar XP manualmente
- **Configuración de recompensas**

### 🎁 Gestión de Sorteos
- **Crear sorteos** desde el dashboard
- **Gestionar sorteos activos**
- **Historial de ganadores**

### 🎤 TempVoice
- **Configuración del sistema**
- **Canales temporales activos**
- **Estadísticas de uso**

### 🧠 IA y Base de Conocimiento
- **Gestión de FAQs** - añadir, editar, eliminar
- **Configuración de GPT** - temperatura, tokens
- **Estadísticas de uso de IA**

### ⚙️ Configuración
- **Configuración del bot por servidor**
- **Canales de logs**
- **Prefijos y permisos**

## 🔒 Seguridad

El dashboard incluye múltiples capas de seguridad:

- ✅ **Discord OAuth2** - Autenticación oficial de Discord
- ✅ **Verificación de permisos** - Solo admins pueden acceder
- ✅ **Rate limiting** - Protección contra spam
- ✅ **Helmet.js** - Headers de seguridad
- ✅ **CORS configurado** - Solo dominios autorizados
- ✅ **Sesiones seguras** - Cookies httpOnly

## 🛠️ Solución de Problemas

### Error: "Invalid redirect_uri"
- ✅ Verifica que `CALLBACK_URL` coincida exactamente con Discord OAuth2
- ✅ Incluye el protocolo (`http://` o `https://`)

### Error: "Unauthorized"
- ✅ Verifica que `CLIENT_SECRET` sea correcto
- ✅ Asegúrate de que el bot esté en el servidor

### Dashboard no carga
- ✅ Verifica que el puerto 3000 esté libre
- ✅ Revisa los logs del servidor
- ✅ Comprueba las variables de entorno

### No aparecen servidores
- ✅ El bot debe estar en el servidor
- ✅ Debes tener permisos de administrador
- ✅ El servidor debe estar en la lista de OAuth2

## 📱 Características Adicionales

### Tiempo Real con Socket.IO
- **Notificaciones instantáneas** cuando se crean/cierran tickets
- **Actualizaciones de estadísticas** sin recargar
- **Logs en vivo** de acciones del bot

### API REST Completa
- **Endpoints documentados** para todas las funciones
- **Autenticación por sesión** 
- **Respuestas JSON** estructuradas

### Interfaz Responsive
- **Diseño móvil** - funciona en tablets y móviles
- **Sidebar colapsable** - optimizado para pantallas pequeñas
- **Tema moderno** - colores de Discord

## 🎉 ¡Listo para Usar!

Una vez configurado, tendrás acceso a:

1. **Dashboard principal**: `http://localhost:3000`
2. **Login Discord**: `http://localhost:3000/auth/discord`
3. **API endpoints**: `http://localhost:3000/api/*`

**¡Disfruta de tu dashboard web profesional! 🚀**

---

**Soporte**: Si tienes problemas, revisa los logs del servidor y verifica que todas las variables de entorno estén configuradas correctamente.
