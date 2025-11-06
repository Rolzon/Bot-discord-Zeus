# 📚 Guía de Base de Conocimiento - Dragon Hosting

## 🎯 ¿Qué es esto?

El bot ahora tiene un **sistema de base de conocimiento personalizado** que le permite responder preguntas sobre tu hosting de videojuegos de manera **natural y conversacional** usando GPT-3.5-turbo.

## ✨ Características

### 🤖 **Respuestas Inteligentes**
- El bot detecta palabras clave en las preguntas
- Usa GPT-3.5 para dar respuestas naturales (no robóticas)
- Mantiene el contexto de la conversación
- Se adapta al tono de la pregunta

### 📝 **Ejemplo de Funcionamiento**

**Usuario pregunta:** "Hola, cuánto cuesta un servidor de Minecraft?"

**El bot:**
1. Detecta palabras clave: "cuanto", "cuesta", "minecraft"
2. Encuentra la FAQ relevante sobre precios
3. GPT-3.5 genera una respuesta natural usando esa información
4. Responde de manera conversacional

**Respuesta del bot:** "¡Hola! 👋 Dragon Hosting tiene varios planes para Minecraft que se ajustan a diferentes presupuestos. Los precios varían según las características que necesites. Te recomiendo visitar https://dragonhosting.lat/ para ver todos nuestros paquetes y elegir el que mejor se adapte a tu servidor. ¿Tienes alguna pregunta específica sobre las características?"

## 🛠️ Comandos de Gestión

### `/kb-add` - Añadir FAQ
Añade una nueva pregunta frecuente a la base de conocimiento.

**Ejemplo:**
```
/kb-add
palabras-clave: descuento, promocion, oferta, rebaja
respuesta: Dragon Hosting ofrece descuentos especiales en fechas especiales y para clientes recurrentes. Síguenos en nuestras redes sociales para estar al tanto de nuestras promociones. También tenemos descuentos por pago anual.
```

### `/kb-list` - Ver FAQs
Muestra todas las FAQs configuradas.

### `/kb-remove` - Eliminar FAQ
Elimina una FAQ por su número.

**Ejemplo:**
```
/kb-remove numero: 5
```

### `/kb-reload` - Recargar
Aplica los cambios realizados (aunque se cargan automáticamente).

## 📋 FAQs Pre-configuradas para Dragon Hosting

Ya incluí 10 FAQs comunes sobre:
1. ✅ Precios y planes
2. ✅ Juegos soportados
3. ✅ Ubicación de servidores
4. ✅ Soporte 24/7
5. ✅ Panel de control
6. ✅ Métodos de pago
7. ✅ Uptime y estabilidad
8. ✅ Backups
9. ✅ Mods y plugins
10. ✅ Protección DDoS

## 🎨 Cómo Personalizar

### Editar el archivo `knowledge-base.json`:

```json
{
  "company": {
    "name": "Dragon Hosting",
    "website": "https://dragonhosting.lat/",
    "description": "Tu descripción aquí"
  },
  "faqs": [
    {
      "keywords": ["palabra1", "palabra2", "palabra3"],
      "answer": "Respuesta que quieres que use el bot como referencia"
    }
  ]
}
```

### 💡 Tips para Palabras Clave:

- Usa sinónimos (precio, costo, cuanto cuesta)
- Incluye errores comunes de escritura
- Piensa en cómo preguntarían los usuarios
- Usa palabras en singular y plural

### 💡 Tips para Respuestas:

- Escribe como si fueras tú respondiendo
- Incluye enlaces cuando sea relevante
- Sé específico pero amigable
- Menciona tu sitio web
- Usa emojis si es tu estilo

## 🚀 Ejemplos de Uso

### Ejemplo 1: Pregunta sobre Precios
```
Usuario: @bot cuanto sale un server de rust?
Bot: ¡Hola! Dragon Hosting tiene excelentes planes para Rust con precios muy competitivos. 
Dependiendo de los slots y recursos que necesites, tenemos opciones desde planes básicos 
hasta servidores dedicados de alto rendimiento. Puedes ver todos los detalles y precios 
en https://dragonhosting.lat/. ¿Te gustaría saber sobre algún plan en específico?
```

### Ejemplo 2: Pregunta sobre Soporte
```
Usuario: @bot tengo un problema con mi servidor, como los contacto?
Bot: ¡No te preocupes! Nuestro equipo de soporte está disponible 24/7 para ayudarte. 
Puedes crear un ticket aquí mismo en Discord usando el comando de tickets, o también 
puedes contactarnos directamente a través de nuestra web https://dragonhosting.lat/. 
¿Qué problema estás teniendo? Quizás pueda ayudarte ahora mismo.
```

### Ejemplo 3: Conversación Natural
```
Usuario: @bot hola
Bot: ¡Hola! 👋 Bienvenido a Dragon Hosting, tu mejor opción para hosting de videojuegos 
en Latinoamérica. ¿En qué puedo ayudarte hoy?

Usuario: que juegos tienen?
Bot: ¡Tenemos una gran variedad! Dragon Hosting soporta todos los juegos populares como 
Minecraft, Rust, ARK, FiveM, CS:GO, Valheim, y muchos más. Nuestra plataforma está 
optimizada para ofrecer el mejor rendimiento en cada juego. ¿Hay algún juego específico 
que te interese?
```

## 🎯 Ventajas de este Sistema

1. **Natural**: No suena como un bot automático
2. **Flexible**: GPT adapta las respuestas al contexto
3. **Fácil de actualizar**: Solo editas el JSON o usas comandos
4. **Inteligente**: Entiende variaciones de las preguntas
5. **Conversacional**: Mantiene el flujo de la charla
6. **Personalizado**: Respuestas específicas de tu negocio

## 📊 Estadísticas

- ✅ 10 FAQs pre-configuradas
- ✅ Detección automática de palabras clave
- ✅ Respuestas en lenguaje natural con GPT-3.5
- ✅ Contexto de conversación mantenido
- ✅ 4 comandos de gestión
- ✅ Fácil de expandir

## 🔄 Actualizar la Base de Conocimiento

### Opción 1: Usar Comandos (Recomendado)
```
/kb-add palabras-clave: nueva,keywords respuesta: Tu respuesta aquí
```

### Opción 2: Editar el Archivo
1. Abre `knowledge-base.json`
2. Añade tu FAQ en el array `faqs`
3. Guarda el archivo
4. Usa `/kb-reload` (opcional)

## 💡 Ideas de FAQs Adicionales

- Horarios de atención
- Políticas de reembolso
- Requisitos técnicos
- Proceso de migración
- Características específicas por juego
- Testimonios de clientes
- Comparación con competidores
- Tutoriales y guías
- Problemas comunes y soluciones

## 🎉 ¡Listo!

Tu bot ahora es un **asistente inteligente** que puede responder preguntas sobre Dragon Hosting de manera natural y profesional. Solo menciona al bot y pregunta lo que quieras.

**Ejemplo:** `@bot necesito un servidor de minecraft para 50 jugadores, que me recomiendas?`
