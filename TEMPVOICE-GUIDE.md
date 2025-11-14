# 🎤 TempVoice - Sistema de Canales Temporales

## 📋 ¿Qué es TempVoice?

TempVoice es un sistema que permite crear **canales de voz temporales** automáticamente. Cuando un usuario se conecta a un canal específico ("Crear Canal Temporal"), se le crea automáticamente un canal de voz personal que se elimina cuando queda vacío.

## ✨ Características

- ✅ **Creación automática** - Los canales se crean al instante
- ✅ **Eliminación automática** - Se borran cuando están vacíos
- ✅ **Permisos de propietario** - El creador puede gestionar su canal
- ✅ **Personalización completa** - Nombre, límite, privacidad
- ✅ **Limpieza automática** - Sistema anti-huérfanos
- ✅ **Fácil configuración** - Un solo comando para empezar

## 🚀 Configuración Inicial

### Paso 1: Configurar el Sistema

Usa el comando `/tempvoice-setup` con los siguientes parámetros:

```
/tempvoice-setup
canal-crear: #🔊┃Crear-Canal-Temporal
categoria: Canales Temporales
nombre-plantilla: 🔊 {username}
limite-usuarios: 0
```

**Parámetros:**
- `canal-crear`: Canal donde los usuarios se conectan para crear su canal temporal
- `categoria`: Categoría donde aparecerán los canales temporales (opcional)
- `nombre-plantilla`: Formato del nombre (`{username}` se reemplaza por el nombre del usuario)
- `limite-usuarios`: Máximo de usuarios por canal (0 = sin límite)

### Paso 2: Crear la Estructura

1. **Crea una categoría** llamada "Canales Temporales"
2. **Crea un canal de voz** llamado "🔊┃Crear Canal Temporal"
3. **Mueve el canal** a la categoría creada
4. **Ejecuta** `/tempvoice-setup` con esos canales

## 🎯 Cómo Funciona

### Para Usuarios Normales:

1. **Conectarse** al canal "🔊┃Crear Canal Temporal"
2. **Automáticamente** se crea un canal temporal con tu nombre
3. **Eres movido** al nuevo canal automáticamente
4. **Tienes permisos** de administrador en tu canal
5. **El canal se elimina** cuando todos salen

### Para Propietarios de Canal:

Usa `/tempvoice` para gestionar tu canal:

- `/tempvoice limite 5` - Cambiar límite de usuarios
- `/tempvoice nombre Mi Canal` - Cambiar nombre del canal
- `/tempvoice privado` - Hacer el canal privado
- `/tempvoice publico` - Hacer el canal público
- `/tempvoice kick @usuario` - Expulsar a alguien
- `/tempvoice info` - Ver información del canal

## 📊 Comandos de Administración

### `/tempvoice-setup`
**Permisos:** Administrador  
**Función:** Configura el sistema TempVoice

**Ejemplo:**
```
/tempvoice-setup 
canal-crear: #crear-canal
categoria: Temporales
nombre-plantilla: 🎤 Sala de {username}
limite-usuarios: 10
```

### `/tempvoice-status`
**Permisos:** Gestionar Canales  
**Función:** Muestra estadísticas del sistema

**Información mostrada:**
- Configuración actual
- Canales temporales activos
- Usuarios conectados
- Estado del bot

### `/tempvoice`
**Permisos:** Estar en un canal temporal  
**Función:** Gestiona tu canal temporal

**Subcomandos:**
- `limite` - Cambiar límite de usuarios
- `nombre` - Cambiar nombre del canal
- `privado` - Hacer privado (solo invitados)
- `publico` - Hacer público
- `kick` - Expulsar usuario
- `info` - Ver información

## 🔧 Permisos Necesarios

### Para el Bot:
- ✅ **Gestionar Canales** - Crear/eliminar canales temporales
- ✅ **Mover Miembros** - Mover usuarios a sus canales
- ✅ **Ver Canales** - Acceder a los canales de voz
- ✅ **Conectar** - Detectar cambios de estado de voz

### Para Propietarios de Canal:
- ✅ **Gestionar Canales** - Modificar su canal temporal
- ✅ **Mover Miembros** - Expulsar usuarios
- ✅ **Silenciar Miembros** - Control de audio
- ✅ **Ensordecer Miembros** - Control de audio

## 🎨 Personalización

### Plantillas de Nombre

Puedes usar estas variables en `nombre-plantilla`:

- `{username}` - Nombre del usuario
- Texto fijo - Cualquier texto que quieras

**Ejemplos:**
- `🔊 {username}` → "🔊 Juan"
- `Sala de {username}` → "Sala de Juan"
- `🎤 Canal Temporal` → "🎤 Canal Temporal"

### Configuraciones Recomendadas

**Para Gaming:**
```
nombre-plantilla: 🎮 Sala de {username}
limite-usuarios: 6
```

**Para Estudio:**
```
nombre-plantilla: 📚 Estudio - {username}
limite-usuarios: 4
```

**Para Música:**
```
nombre-plantilla: 🎵 {username} Live
limite-usuarios: 0
```

## 🛠️ Solución de Problemas

### El bot no crea canales
- ✅ Verifica que el bot tenga permisos de **Gestionar Canales**
- ✅ Asegúrate de que la categoría exista
- ✅ Revisa que el canal de creación esté configurado correctamente

### Los canales no se eliminan
- ✅ El sistema tiene limpieza automática cada pocos minutos
- ✅ Los canales se eliminan cuando el **último usuario** sale
- ✅ Usa `/tempvoice-status` para ver canales activos

### No puedo gestionar mi canal
- ✅ Solo el **propietario** (quien lo creó) puede gestionarlo
- ✅ Debes estar **conectado** al canal temporal
- ✅ El canal debe ser **temporal** (no un canal normal)

### Error de permisos
- ✅ El bot necesita permisos en la **categoría** donde crea canales
- ✅ Verifica que el bot esté **por encima** de los roles que gestiona
- ✅ Asegúrate de que el bot tenga **Mover Miembros**

## 📈 Estadísticas y Monitoreo

Usa `/tempvoice-status` para ver:

- **Configuración actual** del sistema
- **Número de canales** temporales activos
- **Usuarios conectados** en total
- **Estado del bot** y permisos
- **Lista de canales activos** (si son pocos)

## 🎉 Casos de Uso

### 🎮 Servidores de Gaming
- Canales automáticos para partidas
- Límites según el juego (5 para LoL, 6 para Valorant)
- Nombres personalizados por juego

### 📚 Servidores de Estudio
- Salas de estudio privadas
- Límites pequeños (2-4 personas)
- Nombres descriptivos

### 🎵 Servidores de Música
- Salas de escucha compartida
- Sin límites de usuarios
- Nombres creativos

### 💼 Servidores de Trabajo
- Reuniones temporales
- Salas de proyecto
- Control de privacidad

## 🔄 Mantenimiento

El sistema TempVoice es **automático** y requiere poco mantenimiento:

- ✅ **Limpieza automática** de canales huérfanos
- ✅ **Eliminación automática** cuando están vacíos
- ✅ **Gestión de permisos** automática
- ✅ **Logs** de creación y eliminación

---

**¡Disfruta de tu sistema TempVoice! 🎤✨**
