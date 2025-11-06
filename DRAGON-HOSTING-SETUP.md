# 🐉 Dragon Hosting - Setup Rápido del Bot

## 🎯 Configuración Especial para Dragon Hosting

Tu bot ya está **pre-configurado** con información de Dragon Hosting. Aquí está todo lo que necesitas saber:

## ✅ Lo que YA está configurado

### 📚 Base de Conocimiento Pre-cargada

El archivo `knowledge-base.json` ya incluye **10 FAQs** sobre:

1. ✅ **Precios y Planes** - Responde sobre costos
2. ✅ **Juegos Soportados** - Minecraft, Rust, ARK, etc.
3. ✅ **Ubicación de Servidores** - Latencia en Latinoamérica
4. ✅ **Soporte 24/7** - Cómo contactar
5. ✅ **Panel de Control** - Acceso y gestión
6. ✅ **Métodos de Pago** - PayPal, tarjetas, etc.
7. ✅ **Uptime 99.9%** - Estabilidad garantizada
8. ✅ **Backups Automáticos** - Seguridad de datos
9. ✅ **Mods y Plugins** - Personalización
10. ✅ **Protección DDoS** - Seguridad incluida

### 🌐 Información de la Empresa

```json
{
  "name": "Dragon Hosting",
  "website": "https://dragonhosting.lat/",
  "description": "Hosting de videojuegos profesional en Latinoamérica"
}
```

## 🚀 Inicio Rápido

### 1. Instalar Dependencias
```bash
cd C:\Users\crist\CascadeProjects\discord-super-bot
npm install
```

### 2. Configurar .env
Crea el archivo `.env` con:
```env
DISCORD_TOKEN=tu_token_de_discord
OPENAI_API_KEY=tu_api_key_de_openai
CLIENT_ID=tu_client_id
```

### 3. Desplegar Comandos
```bash
node src/deploy-commands.js
```

### 4. Iniciar el Bot
```bash
npm start
```

## 💬 Ejemplos de Conversación

### Ejemplo 1: Pregunta sobre Precios
```
Usuario: @bot cuanto cuesta un servidor de minecraft?

Bot: ¡Hola! Dragon Hosting ofrece varios planes de hosting para Minecraft 
que se ajustan a diferentes presupuestos. Puedes ver todos nuestros precios 
y paquetes en https://dragonhosting.lat/. Tenemos opciones desde servidores 
pequeños hasta dedicados de alto rendimiento. ¿Tienes alguna pregunta 
específica sobre las características que necesitas?
```

### Ejemplo 2: Pregunta sobre Soporte
```
Usuario: @bot necesito ayuda con mi servidor

Bot: ¡Por supuesto! Nuestro equipo de soporte está disponible 24/7 para 
ayudarte. Puedes crear un ticket aquí mismo en Discord usando el comando 
de tickets, o contactarnos directamente a través de nuestra página web 
https://dragonhosting.lat/. ¿Qué problema estás teniendo? Quizás pueda 
ayudarte ahora mismo.
```

### Ejemplo 3: Pregunta sobre Juegos
```
Usuario: @bot soportan rust y ark?

Bot: ¡Sí! Dragon Hosting soporta tanto Rust como ARK, además de muchos 
otros juegos populares como Minecraft, FiveM, CS:GO, Valheim y más. 
Nuestros servidores están optimizados para cada juego, garantizando el 
mejor rendimiento posible. ¿Te gustaría saber más sobre algún juego en 
específico?
```

## 🛠️ Personalizar FAQs

### Opción 1: Usar Comandos (Más Fácil)

```
/kb-add
palabras-clave: discord,comunidad,servidor discord
respuesta: Únete a nuestra comunidad de Discord donde podrás conocer a otros jugadores, obtener soporte rápido y estar al tanto de todas las novedades. ¡Te esperamos!
```

### Opción 2: Editar el Archivo

Abre `knowledge-base.json` y añade:

```json
{
  "keywords": ["tu", "palabra", "clave"],
  "answer": "Tu respuesta aquí. Menciona https://dragonhosting.lat/ cuando sea relevante."
}
```

## 📊 Comandos de Gestión

| Comando | Uso |
|---------|-----|
| `/kb-add` | Añadir nueva FAQ |
| `/kb-list` | Ver todas las FAQs |
| `/kb-remove` | Eliminar FAQ por número |
| `/kb-reload` | Recargar cambios |

## 🎯 Tips para Mejores Respuestas

### ✅ Hacer:
- Usa palabras clave variadas (precio, costo, cuanto cuesta)
- Incluye tu URL en respuestas relevantes
- Sé amigable y profesional
- Menciona características específicas
- Usa emojis moderadamente

### ❌ Evitar:
- Respuestas muy largas (GPT las adaptará)
- Información desactualizada
- Promesas que no puedes cumplir
- Lenguaje muy técnico sin explicación

## 🔥 Funciones Especiales para Hosting

### Sistema de Tickets
Perfecto para soporte técnico:
```
/ticket-setup canal: #soporte categoria: Tickets
```

### Sistema de Anuncios
Para promociones y novedades:
```
/announce 
titulo: ¡50% de Descuento!
mensaje: Esta semana todos nuestros planes tienen 50% de descuento...
```

### Sistema de Niveles
Gamifica tu comunidad:
- Los usuarios ganan XP al participar
- Crea roles de recompensa por nivel
- Fomenta la actividad

## 📈 Métricas de Éxito

El bot te ayudará a:
- ✅ Responder preguntas 24/7
- ✅ Reducir carga de soporte
- ✅ Aumentar conversiones
- ✅ Mejorar experiencia del cliente
- ✅ Construir comunidad activa

## 🆘 Soporte

Si necesitas ayuda:
1. Lee `KNOWLEDGE-BASE-GUIDE.md` para detalles completos
2. Revisa `README.md` para configuración general
3. Usa `/kb-list` para ver FAQs actuales
4. Edita `knowledge-base.json` para personalizar

## 🎉 ¡Listo!

Tu bot está configurado específicamente para Dragon Hosting con:
- ✅ 10 FAQs pre-cargadas
- ✅ Información de la empresa
- ✅ Respuestas naturales con GPT-3.5
- ✅ Sistema de gestión fácil
- ✅ 60+ comandos adicionales

**Solo menciona al bot y pregunta lo que quieras sobre Dragon Hosting!**

---

**Dragon Hosting** 🐉
https://dragonhosting.lat/
*Tu mejor opción para hosting de videojuegos en Latinoamérica*
