# 🗄️ Configuración de MongoDB

Este bot utiliza MongoDB para almacenar todos los datos de forma persistente y escalable.

## 📊 Datos Almacenados

El bot guarda automáticamente:

- **Mensajes**: Todos los mensajes enviados en el servidor (contenido, adjuntos, menciones)
- **Usuarios**: Información de usuarios, niveles, XP y estadísticas
- **Advertencias**: Historial de advertencias por usuario
- **Sorteos**: Información de sorteos activos y finalizados
- **Tickets**: Registro de tickets de soporte
- **Configuración de Servidores**: Ajustes personalizados por servidor

## 🚀 Configuración Rápida

### 1. Crear cuenta en MongoDB Atlas (Gratis)

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea una cuenta gratuita
3. Crea un nuevo cluster (elige el plan gratuito M0)
4. Espera a que el cluster se cree (2-5 minutos)

### 2. Configurar acceso a la base de datos

1. En tu cluster, haz clic en **"Connect"**
2. Selecciona **"Connect your application"**
3. Copia la cadena de conexión (URI)
4. Reemplaza `<password>` con tu contraseña
5. Reemplaza `<dbname>` con el nombre de tu base de datos (ej: `discord-bot`)

### 3. Configurar el bot

1. Abre tu archivo `.env`
2. Agrega la variable `MONGODB_URI`:

```env
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/discord-bot?retryWrites=true&w=majority
```

### 4. Configurar IP permitidas (Whitelist)

1. En MongoDB Atlas, ve a **Network Access**
2. Haz clic en **"Add IP Address"**
3. Selecciona **"Allow Access from Anywhere"** (0.0.0.0/0)
   - O agrega solo la IP de tu servidor para mayor seguridad

## ✅ Verificación

Cuando inicies el bot, deberías ver en la consola:

```
✅ Conectado a MongoDB
```

Si ves este mensaje, ¡todo está funcionando correctamente!

## 🔄 Modo Fallback

Si MongoDB no está configurado o no está disponible:

- El bot seguirá funcionando normalmente
- Los datos se guardarán en memoria (archivo JSON local)
- Verás el mensaje: `⚠️ MONGODB_URI no configurado. El bot funcionará sin base de datos.`

## 📦 Modelos de Datos

### User (Usuario)
- userId, guildId
- username, discriminator
- level, xp, messages
- warnings (array de advertencias)
- timestamps

### Message (Mensaje)
- messageId, guildId, channelId, userId
- content, attachments, embeds
- mentions, isEdited, isDeleted
- timestamps

### Giveaway (Sorteo)
- messageId, guildId, channelId
- prize, winners, endTime
- participants, winnerIds
- isEnded

### Ticket (Ticket de Soporte)
- channelId, guildId, userId
- ticketNumber, category, status
- messages (array)
- closedBy, closedAt

### Guild (Servidor)
- guildId, name, ownerId
- settings (configuración personalizada)
- stats (estadísticas del servidor)

## 🔍 Consultas y Análisis

Puedes usar MongoDB Compass o la interfaz web de Atlas para:

- Ver todos los mensajes enviados
- Analizar estadísticas de usuarios
- Exportar datos
- Crear reportes personalizados

## 🛡️ Seguridad

- **Nunca compartas tu MONGODB_URI** en GitHub o públicamente
- Usa variables de entorno (`.env`)
- El archivo `.env` está en `.gitignore` por defecto
- Considera usar IP whitelist en producción

## 📈 Escalabilidad

MongoDB Atlas ofrece:

- **Plan Gratuito**: 512 MB de almacenamiento
- **Planes Pagos**: Desde $9/mes con más almacenamiento y rendimiento
- **Backups automáticos** en planes pagos
- **Réplicas** para alta disponibilidad

## ❓ Problemas Comunes

### Error: "Authentication failed"
- Verifica que la contraseña en el URI sea correcta
- Asegúrate de que el usuario tenga permisos de lectura/escritura

### Error: "Connection timeout"
- Verifica que tu IP esté en la whitelist
- Comprueba tu conexión a internet

### El bot no guarda datos
- Verifica que `MONGODB_URI` esté configurado en `.env`
- Revisa los logs del bot para ver errores de conexión

## 📚 Recursos Adicionales

- [Documentación de MongoDB](https://docs.mongodb.com/)
- [MongoDB Atlas Tutorial](https://www.mongodb.com/docs/atlas/getting-started/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
