import { Events, ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { MongoClient } from 'mongodb';

export default {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;
        
        // Solo procesar botones de tickets
        if (!interaction.customId.startsWith('ticket_')) return;
        
        const action = interaction.customId.split('_')[1];
        
        try {
            switch (action) {
                case 'create':
                    await handleTicketCreate(interaction);
                    break;
                case 'close':
                    await handleTicketClose(interaction);
                    break;
                case 'reopen':
                    await handleTicketReopen(interaction);
                    break;
                case 'delete':
                    await handleTicketDelete(interaction);
                    break;
                case 'claim':
                    await handleTicketClaim(interaction);
                    break;
            }
        } catch (error) {
            console.error('Error en sistema de tickets:', error);
            
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ Ocurrió un error al procesar el ticket.',
                    ephemeral: true
                });
            }
        }
    }
};

async function handleTicketCreate(interaction) {
    const guild = interaction.guild;
    const user = interaction.user;
    
    // Verificar si el usuario ya tiene un ticket abierto
    const existingTicket = guild.channels.cache.find(
        channel => channel.name === `ticket-${user.username.toLowerCase()}` && 
                  channel.type === ChannelType.GuildText
    );
    
    if (existingTicket) {
        return await interaction.reply({
            content: `❌ Ya tienes un ticket abierto: ${existingTicket}`,
            ephemeral: true
        });
    }
    
    await interaction.deferReply({ ephemeral: true });
    
    try {
        // Buscar categoría de tickets
        let ticketCategory = guild.channels.cache.find(
            channel => channel.name.toLowerCase().includes('tickets') && 
                      channel.type === ChannelType.GuildCategory
        );
        
        // Crear categoría si no existe
        if (!ticketCategory) {
            ticketCategory = await guild.channels.create({
                name: '🎫 TICKETS',
                type: ChannelType.GuildCategory,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    }
                ]
            });
        }
        
        // Crear canal de ticket
        const ticketChannel = await guild.channels.create({
            name: `ticket-${user.username.toLowerCase()}`,
            type: ChannelType.GuildText,
            parent: ticketCategory.id,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                },
                {
                    id: guild.members.me.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ManageChannels
                    ]
                }
            ]
        });
        
        // Añadir permisos para roles de staff si existen
        const staffRoles = guild.roles.cache.filter(role => 
            role.name.toLowerCase().includes('staff') ||
            role.name.toLowerCase().includes('mod') ||
            role.name.toLowerCase().includes('admin') ||
            role.permissions.has(PermissionFlagsBits.ManageMessages)
        );
        
        for (const role of staffRoles.values()) {
            await ticketChannel.permissionOverwrites.create(role.id, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true
            });
        }
        
        // Crear embed de bienvenida
        const welcomeEmbed = new EmbedBuilder()
            .setTitle('🎫 Ticket Creado')
            .setDescription(`¡Hola ${user}! Tu ticket ha sido creado exitosamente.\n\nUn miembro del staff te atenderá pronto. Mientras tanto, describe tu problema o consulta con el mayor detalle posible.`)
            .setColor('#00ff00')
            .addFields(
                { name: '📝 Información', value: 'Este ticket es privado y solo tú y el staff pueden verlo.' },
                { name: '⏰ Tiempo de respuesta', value: 'Normalmente respondemos en menos de 24 horas.' }
            )
            .setFooter({ text: `Ticket ID: ${ticketChannel.id}` })
            .setTimestamp();
        
        // Botones de control del ticket
        const ticketControls = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_close')
                    .setLabel('Cerrar Ticket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒'),
                new ButtonBuilder()
                    .setCustomId('ticket_claim')
                    .setLabel('Reclamar')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('👋')
            );
        
        await ticketChannel.send({
            content: `${user} | Staff: ${staffRoles.map(r => `<@&${r.id}>`).join(' ')}`,
            embeds: [welcomeEmbed],
            components: [ticketControls]
        });
        
        // Guardar ticket en base de datos
        await saveTicketToDatabase({
            id: ticketChannel.id,
            guildId: guild.id,
            userId: user.id,
            channelName: ticketChannel.name,
            status: 'open',
            createdAt: new Date(),
            claimedBy: null,
            category: 'general'
        });
        
        // Notificar al dashboard web en tiempo real
        notifyDashboard(guild.id, 'ticket-created', {
            ticketId: ticketChannel.id,
            ticketName: ticketChannel.name,
            userId: user.id,
            userName: user.username,
            createdAt: new Date()
        });
        
        await interaction.editReply({
            content: `✅ Tu ticket ha sido creado: ${ticketChannel}`,
            ephemeral: true
        });
        
    } catch (error) {
        console.error('Error creando ticket:', error);
        await interaction.editReply({
            content: '❌ Error al crear el ticket. Contacta con un administrador.',
            ephemeral: true
        });
    }
}

async function handleTicketClose(interaction) {
    const channel = interaction.channel;
    
    if (!channel.name.startsWith('ticket-')) {
        return await interaction.reply({
            content: '❌ Este comando solo se puede usar en canales de tickets.',
            ephemeral: true
        });
    }
    
    await interaction.deferReply();
    
    try {
        // Crear transcript del ticket
        const messages = await channel.messages.fetch({ limit: 100 });
        const transcript = messages.reverse().map(msg => 
            `[${msg.createdAt.toLocaleString()}] ${msg.author.tag}: ${msg.content}`
        ).join('\n');
        
        // Guardar transcript
        await updateTicketInDatabase(channel.id, {
            status: 'closed',
            closedAt: new Date(),
            closedBy: interaction.user.id,
            transcript: transcript
        });
        
        // Embed de cierre
        const closeEmbed = new EmbedBuilder()
            .setTitle('🔒 Ticket Cerrado')
            .setDescription(`Este ticket ha sido cerrado por ${interaction.user}.`)
            .setColor('#ff0000')
            .addFields(
                { name: '📋 Transcript', value: 'El historial del ticket ha sido guardado.' },
                { name: '🔄 Reapertura', value: 'Puedes reabrir el ticket si es necesario.' }
            )
            .setTimestamp();
        
        const reopenButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_reopen')
                    .setLabel('Reabrir Ticket')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🔓'),
                new ButtonBuilder()
                    .setCustomId('ticket_delete')
                    .setLabel('Eliminar Ticket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🗑️')
            );
        
        await interaction.editReply({
            embeds: [closeEmbed],
            components: [reopenButton]
        });
        
        // Remover permisos del usuario original
        const ticketUser = channel.name.split('-')[1];
        const user = interaction.guild.members.cache.find(m => 
            m.user.username.toLowerCase() === ticketUser
        );
        
        if (user) {
            await channel.permissionOverwrites.edit(user.id, {
                ViewChannel: false,
                SendMessages: false
            });
        }
        
        // Notificar al dashboard
        notifyDashboard(interaction.guild.id, 'ticket-closed', {
            ticketId: channel.id,
            closedBy: interaction.user.username,
            closedAt: new Date()
        });
        
    } catch (error) {
        console.error('Error cerrando ticket:', error);
        await interaction.editReply({
            content: '❌ Error al cerrar el ticket.',
            ephemeral: true
        });
    }
}

async function handleTicketReopen(interaction) {
    const channel = interaction.channel;
    
    await interaction.deferReply();
    
    try {
        // Restaurar permisos del usuario original
        const ticketUser = channel.name.split('-')[1];
        const user = interaction.guild.members.cache.find(m => 
            m.user.username.toLowerCase() === ticketUser
        );
        
        if (user) {
            await channel.permissionOverwrites.edit(user.id, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true
            });
        }
        
        // Actualizar base de datos
        await updateTicketInDatabase(channel.id, {
            status: 'open',
            reopenedAt: new Date(),
            reopenedBy: interaction.user.id
        });
        
        const reopenEmbed = new EmbedBuilder()
            .setTitle('🔓 Ticket Reabierto')
            .setDescription(`Este ticket ha sido reabierto por ${interaction.user}.`)
            .setColor('#00ff00')
            .setTimestamp();
        
        const closeButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_close')
                    .setLabel('Cerrar Ticket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒')
            );
        
        await interaction.editReply({
            embeds: [reopenEmbed],
            components: [closeButton]
        });
        
        // Notificar al dashboard
        notifyDashboard(interaction.guild.id, 'ticket-reopened', {
            ticketId: channel.id,
            reopenedBy: interaction.user.username,
            reopenedAt: new Date()
        });
        
    } catch (error) {
        console.error('Error reabriendo ticket:', error);
        await interaction.editReply({
            content: '❌ Error al reabrir el ticket.'
        });
    }
}

async function handleTicketDelete(interaction) {
    const channel = interaction.channel;
    
    await interaction.reply({
        content: '⚠️ ¿Estás seguro de que quieres eliminar este ticket permanentemente?\nEsta acción no se puede deshacer.',
        ephemeral: true
    });
    
    // Esperar confirmación (simplificado)
    setTimeout(async () => {
        try {
            // Eliminar de base de datos
            await deleteTicketFromDatabase(channel.id);
            
            // Notificar al dashboard
            notifyDashboard(interaction.guild.id, 'ticket-deleted', {
                ticketId: channel.id,
                ticketName: channel.name,
                deletedBy: interaction.user.username,
                deletedAt: new Date()
            });
            
            // Eliminar canal
            await channel.delete('Ticket eliminado por ' + interaction.user.tag);
            
        } catch (error) {
            console.error('Error eliminando ticket:', error);
        }
    }, 5000); // 5 segundos de delay
}

async function handleTicketClaim(interaction) {
    const channel = interaction.channel;
    
    try {
        await updateTicketInDatabase(channel.id, {
            claimedBy: interaction.user.id,
            claimedAt: new Date()
        });
        
        const claimEmbed = new EmbedBuilder()
            .setTitle('👋 Ticket Reclamado')
            .setDescription(`${interaction.user} ha reclamado este ticket y se hará cargo de tu consulta.`)
            .setColor('#0099ff')
            .setTimestamp();
        
        await interaction.reply({
            embeds: [claimEmbed]
        });
        
        // Notificar al dashboard
        notifyDashboard(interaction.guild.id, 'ticket-claimed', {
            ticketId: channel.id,
            claimedBy: interaction.user.username,
            claimedAt: new Date()
        });
        
    } catch (error) {
        console.error('Error reclamando ticket:', error);
        await interaction.reply({
            content: '❌ Error al reclamar el ticket.',
            ephemeral: true
        });
    }
}

// Funciones de base de datos
async function saveTicketToDatabase(ticketData) {
    try {
        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        
        const db = client.db();
        const collection = db.collection('tickets');
        
        await collection.insertOne(ticketData);
        await client.close();
    } catch (error) {
        console.error('Error guardando ticket en BD:', error);
    }
}

async function updateTicketInDatabase(ticketId, updateData) {
    try {
        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        
        const db = client.db();
        const collection = db.collection('tickets');
        
        await collection.updateOne(
            { id: ticketId },
            { $set: updateData }
        );
        
        await client.close();
    } catch (error) {
        console.error('Error actualizando ticket en BD:', error);
    }
}

async function deleteTicketFromDatabase(ticketId) {
    try {
        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        
        const db = client.db();
        const collection = db.collection('tickets');
        
        await collection.deleteOne({ id: ticketId });
        await client.close();
    } catch (error) {
        console.error('Error eliminando ticket de BD:', error);
    }
}

// Función para notificar al dashboard web
function notifyDashboard(guildId, event, data) {
    try {
        // Esto se conectaría con Socket.IO del dashboard
        // Por ahora es un placeholder
        console.log(`Dashboard notification: ${event}`, data);
        
        // En una implementación real, esto enviaría datos al dashboard web
        // usando Socket.IO o webhooks
    } catch (error) {
        console.error('Error notificando dashboard:', error);
    }
}
