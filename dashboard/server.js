import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Client, GatewayIntentBits } from 'discord.js';

// Cargar variables de entorno
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Crear aplicación Express
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.DASHBOARD_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Configuración de seguridad
app.use(helmet({
  contentSecurityPolicy: false // Permitir inline scripts para el dashboard
}));

app.use(cors({
  origin: process.env.DASHBOARD_URL || "http://localhost:3000",
  credentials: true
}));

// Trust proxy - necesario para rate limiting detrás de proxy/nginx
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 requests por IP
});
app.use(limiter);

// Configuración de Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

// Configuración de sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'zeus-dashboard-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Configuración de Passport para Discord OAuth2
passport.use(new DiscordStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL || 'http://localhost:3000/auth/discord/callback',
  scope: ['identify', 'guilds']
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.use(passport.initialize());
app.use(passport.session());

// Cliente Discord para el dashboard (solo lectura)
const dashboardClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ]
});

// Conectar cliente del dashboard
dashboardClient.login(process.env.DISCORD_TOKEN);

// Middleware de autenticación
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/discord');
}

// Middleware para verificar permisos de administrador
async function ensureAdmin(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/auth/discord');
  }

  const guildId = req.params.guildId || req.body.guildId;
  if (!guildId) {
    return res.status(400).json({ error: 'Guild ID requerido' });
  }

  try {
    const guild = await dashboardClient.guilds.fetch(guildId);
    const member = await guild.members.fetch(req.user.id);
    
    if (member.permissions.has('Administrator') || member.permissions.has('ManageGuild')) {
      return next();
    }
    
    res.status(403).json({ error: 'No tienes permisos de administrador en este servidor' });
  } catch (error) {
    res.status(404).json({ error: 'Servidor no encontrado o bot no está en el servidor' });
  }
}

// Rutas de autenticación
app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) console.error(err);
    res.redirect('/');
  });
});

// Rutas principales
app.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

app.get('/dashboard', ensureAuthenticated, async (req, res) => {
  try {
    // Obtener servidores del usuario donde el bot está presente
    const userGuilds = req.user.guilds || [];
    const botGuilds = dashboardClient.guilds.cache;
    
    const mutualGuilds = userGuilds.filter(guild => 
      botGuilds.has(guild.id) && 
      (guild.permissions & 0x8) === 0x8 // Verificar permisos de administrador
    );

    res.render('dashboard', { 
      user: req.user, 
      guilds: mutualGuilds,
      botGuilds: botGuilds.size
    });
  } catch (error) {
    console.error('Error en dashboard:', error);
    res.render('dashboard', { 
      user: req.user, 
      guilds: [],
      botGuilds: 0,
      error: 'Error cargando servidores'
    });
  }
});

// Importar rutas
import dashboardRoutes from './routes/dashboard.js';
import ticketRoutes from './routes/tickets.js';
import apiRoutes from './routes/api.js';

app.use('/guild', ensureAuthenticated, dashboardRoutes);
app.use('/tickets', ensureAuthenticated, ticketRoutes);
app.use('/api', ensureAuthenticated, apiRoutes);

// Socket.IO para tiempo real
io.on('connection', (socket) => {
  console.log('Usuario conectado al dashboard:', socket.id);
  
  socket.on('join-guild', (guildId) => {
    socket.join(`guild-${guildId}`);
    console.log(`Usuario se unió a la sala del servidor: ${guildId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Usuario desconectado del dashboard:', socket.id);
  });
});

// Exportar io para usar en otras rutas
export { io, dashboardClient };

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    error: 'Error interno del servidor',
    user: req.user 
  });
});

// Ruta 404
app.use((req, res) => {
  res.status(404).render('error', { 
    error: 'Página no encontrada',
    user: req.user 
  });
});

// Iniciar servidor
const PORT = process.env.DASHBOARD_PORT || 3000;
server.listen(PORT, () => {
  console.log(`🌐 Dashboard web iniciado en http://localhost:${PORT}`);
  console.log(`🔗 URL de autenticación: http://localhost:${PORT}/auth/discord`);
});

export default app;
