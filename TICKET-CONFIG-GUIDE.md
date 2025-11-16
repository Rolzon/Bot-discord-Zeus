# 🎫 Guía de Configuración del Sistema de Tickets

## Descripción General

El sistema de tickets ahora permite configurar una **categoría fija** desde Discord donde se crearán todos los tickets, tanto los creados desde el panel web como los creados dentro del servidor de Discord.

## 📋 Características

- ✅ Categoría fija configurable desde Discord
- ✅ Roles de soporte personalizables
- ✅ Canal de transcripciones configurable
- ✅ Límite de tickets por usuario
- ✅ Sincronización entre Discord y Dashboard Web
- ✅ Configuración persistente en base de datos

## 🛠️ Comandos de Configuración

### `/ticket-config categoria`
Establece la categoría donde se crearán todos los tickets.

**Uso:**
```
/ticket-config categoria [categoria: Categoría de Discord]
```

**Ejemplo:**
```
/ticket-config categoria categoria:🎫 TICKETS
```

**Resultado:**
- Todos los tickets nuevos se crearán en esta categoría
- Se aplica tanto a tickets desde Discord como desde el dashboard web
- La configuración se guarda en la base de datos

---

### `/ticket-config rol-soporte`
Añade un rol que puede ver y gestionar todos los tickets.

**Uso:**
```
/ticket-config rol-soporte [rol: Rol de Discord]
```

**Ejemplo:**
```
/ticket-config rol-soporte rol:@Staff
```

**Resultado:**
- El rol tendrá acceso automático a todos los tickets
- Puede ver, leer y enviar mensajes en cualquier ticket
- Se pueden añadir múltiples roles de soporte

---

### `/ticket-config remover-rol`
Remueve un rol de soporte del sistema de tickets.

**Uso:**
```
/ticket-config remover-rol [rol: Rol de Discord]
```

**Ejemplo:**
```
/ticket-config remover-rol rol:@Moderador
```

---

### `/ticket-config transcripciones`
Establece el canal donde se guardarán las transcripciones de tickets cerrados.

**Uso:**
```
/ticket-config transcripciones [canal: Canal de texto]
```

**Ejemplo:**
```
/ticket-config transcripciones canal:#ticket-logs
```

---

### `/ticket-config max-tickets`
Establece el máximo de tickets abiertos por usuario simultáneamente.

**Uso:**
```
/ticket-config max-tickets [cantidad: 1-5]
```

**Ejemplo:**
```
/ticket-config max-tickets cantidad:2
```

**Resultado:**
- Los usuarios solo podrán tener el número especificado de tickets abiertos
- Si intentan crear más, recibirán un mensaje de error

---

### `/ticket-config ver`
Muestra la configuración actual del sistema de tickets.

**Uso:**
```
/ticket-config ver
```

**Muestra:**
- Categoría configurada
- Roles de soporte
- Canal de transcripciones
- Límite de tickets por usuario
- Estado del sistema

---

## 🚀 Configuración Inicial Recomendada

### Paso 1: Crear la Categoría
1. Crea una categoría en Discord llamada "🎫 TICKETS" (o el nombre que prefieras)
2. Configura los permisos de la categoría:
   - `@everyone`: Sin acceso (ViewChannel: ❌)
   - `@Bot`: Acceso completo

### Paso 2: Configurar la Categoría en el Bot
```
/ticket-config categoria categoria:🎫 TICKETS
```

### Paso 3: Añadir Roles de Soporte
```
/ticket-config rol-soporte rol:@Staff
/ticket-config rol-soporte rol:@Moderador
/ticket-config rol-soporte rol:@Admin
```

### Paso 4: Configurar Canal de Transcripciones (Opcional)
```
/ticket-config transcripciones canal:#ticket-logs
```

### Paso 5: Establecer Límite de Tickets (Opcional)
```
/ticket-config max-tickets cantidad:1
```

### Paso 6: Verificar Configuración
```
/ticket-config ver
```

---

## 🌐 Integración con el Dashboard Web

Una vez configurada la categoría desde Discord:

1. **Crear Ticket desde Dashboard:**
   - Ve a `/tickets/:guildId` en el dashboard web
   - Haz clic en "Crear Ticket"
   - El ticket se creará automáticamente en la categoría configurada

2. **Asignar a Usuario:**
   - Puedes asignar el ticket a un usuario específico
   - El usuario recibirá permisos automáticamente

3. **Sincronización:**
   - Los tickets creados desde el dashboard aparecen en Discord
   - Los tickets creados desde Discord aparecen en el dashboard
   - Actualizaciones en tiempo real vía Socket.IO

---

## ⚠️ Notas Importantes

### Categoría Eliminada
Si la categoría configurada es eliminada:
- Los usuarios recibirán un mensaje de error al intentar crear tickets
- Un administrador debe reconfigurar la categoría con `/ticket-config categoria`

### Sin Configuración
Si no hay categoría configurada:
- El bot buscará una categoría con "tickets" en el nombre
- Si no encuentra ninguna, creará una automáticamente llamada "🎫 TICKETS"
- La categoría creada se guardará en la configuración

### Roles de Soporte
Si no hay roles configurados:
- El bot buscará roles con nombres como "staff", "mod", "admin"
- También buscará roles con permisos de `ManageMessages`
- Se recomienda configurar roles específicos para mejor control

---

## 🔧 Solución de Problemas

### Los tickets no se crean en la categoría correcta
1. Verifica la configuración: `/ticket-config ver`
2. Asegúrate de que la categoría existe
3. Reconfigura si es necesario: `/ticket-config categoria`

### Los roles de soporte no tienen acceso
1. Verifica que los roles estén configurados: `/ticket-config ver`
2. Añade los roles necesarios: `/ticket-config rol-soporte`
3. Verifica los permisos de la categoría en Discord

### Error al crear ticket desde el dashboard
1. Verifica que el bot esté online
2. Verifica que la categoría configurada existe
3. Verifica los permisos del bot en la categoría

---

## 📊 Ejemplo de Configuración Completa

```bash
# 1. Configurar categoría
/ticket-config categoria categoria:🎫 SOPORTE

# 2. Añadir roles de soporte
/ticket-config rol-soporte rol:@Staff
/ticket-config rol-soporte rol:@Moderadores

# 3. Configurar transcripciones
/ticket-config transcripciones canal:#logs-tickets

# 4. Establecer límite
/ticket-config max-tickets cantidad:1

# 5. Verificar
/ticket-config ver
```

**Resultado:**
```
⚙️ Configuración del Sistema de Tickets

📂 Categoría de Tickets: 🎫 SOPORTE (123456789012345678)
👥 Roles de Soporte: Staff, Moderadores
📝 Canal de Transcripciones: logs-tickets (987654321098765432)
🎫 Máximo de Tickets por Usuario: 1 ticket(s)
✅ Estado: Habilitado
```

---

## 🎯 Ventajas del Sistema

1. **Organización:** Todos los tickets en una categoría específica
2. **Flexibilidad:** Configurable según las necesidades del servidor
3. **Consistencia:** Misma configuración para Discord y Dashboard
4. **Control:** Roles de soporte específicos y límites personalizables
5. **Persistencia:** Configuración guardada en base de datos
6. **Facilidad:** Comandos simples y claros

---

## 📝 Permisos Requeridos

Para usar `/ticket-config`:
- **Administrator** (Administrador del servidor)

El bot necesita:
- **Manage Channels** (Gestionar canales)
- **View Channel** (Ver canal)
- **Send Messages** (Enviar mensajes)
- **Manage Permissions** (Gestionar permisos)

---

## 🆘 Soporte

Si tienes problemas con la configuración:
1. Verifica que el bot tenga los permisos necesarios
2. Revisa la configuración con `/ticket-config ver`
3. Consulta los logs del bot para errores
4. Contacta al desarrollador si el problema persiste
