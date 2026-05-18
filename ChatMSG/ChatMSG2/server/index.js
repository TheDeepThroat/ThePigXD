import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env from the same directory as this file, regardless of CWD
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '.env') });
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';

// ─── Configuration ──────────────────────────────────────────────────────────
const PORT          = process.env.PORT          || 3001;
const REDIS_URL     = process.env.REDIS_URL     || 'redis://localhost:6379';
const JWT_SECRET    = process.env.JWT_SECRET    || 'chatmsg_dev_secret_change_in_prod';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const SERVER_ID     = `Server-${PORT}`;

// ─── Redis Keys ──────────────────────────────────────────────────────────────
const MESSAGES_KEY = 'chatmsg:messages';
const ONLINE_KEY = 'chatmsg:online';

// ─── Express & Socket.IO ─────────────────────────────────────────────────────
const app = express();
const httpServer = createServer(app);

const corsOptions = {
  origin: CLIENT_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST'],
};

const io = new Server(httpServer, { cors: corsOptions });

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// ─── Redis Clients ───────────────────────────────────────────────────────────
const pubClient = createClient({ url: REDIS_URL });
const subClient = pubClient.duplicate();

pubClient.on('error', (err) => console.error(`[${SERVER_ID}] Redis pub error:`, err.message));
subClient.on('error', (err) => console.error(`[${SERVER_ID}] Redis sub error:`, err.message));

// ─── Redis Helpers ───────────────────────────────────────────────────────────
function parseCookies(cookieStr = '') {
  const cookies = {};
  cookieStr.split(';').forEach((pair) => {
    const idx = pair.indexOf('=');
    if (idx < 0) return;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    try { cookies[key] = decodeURIComponent(val); } catch { cookies[key] = val; }
  });
  return cookies;
}

async function getMessages() {
  const raw = await pubClient.lRange(MESSAGES_KEY, 0, -1);
  return raw.map((m) => JSON.parse(m));
}

async function addMessage(msg) {
  await pubClient.rPush(MESSAGES_KEY, JSON.stringify(msg));
  await pubClient.lTrim(MESSAGES_KEY, -100, -1); // keep last 100
}

async function addOnlineUser(username) { await pubClient.sAdd(ONLINE_KEY, username); }
async function removeOnlineUser(username) { await pubClient.sRem(ONLINE_KEY, username); }
async function getOnlineUsers() { return pubClient.sMembers(ONLINE_KEY); }

// ─── HTTP Routes ─────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', async (_req, res) => {
  const users = await getOnlineUsers();
  res.json({ status: 'ok', server: SERVER_ID, onlineUsers: users.length });
});

// Login: generate JWT → set HttpOnly cookie
app.post('/api/login', async (req, res) => {
  const raw = req.body.username ?? '';
  const username = String(raw).trim();

  if (!username) {
    return res.status(400).json({ error: 'Username is required.' });
  }
  if (username.length > 20) {
    return res.status(400).json({ error: 'Username must be 20 characters or less.' });
  }

  // Check availability (atomic enough for this exercise)
  const online = await getOnlineUsers();
  const taken = online.some((u) => u.toLowerCase() === username.toLowerCase());
  if (taken) {
    return res.status(409).json({ error: 'Username is already taken.' });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });

  res.cookie('chatmsg_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
    // secure: true  ← enable in production (HTTPS)
  });

  res.json({ success: true, username, server: SERVER_ID });
});

// Logout: clear cookie
app.post('/api/logout', (_req, res) => {
  res.clearCookie('chatmsg_token');
  res.json({ success: true });
});

// ─── Socket.IO Middleware: verify JWT from HttpOnly cookie ───────────────────
io.use((socket, next) => {
  const cookies = parseCookies(socket.handshake.headers.cookie);
  const token = cookies['chatmsg_token'];

  if (!token) {
    return next(new Error('AUTH_REQUIRED'));
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    socket.data.username = payload.username;
    next();
  } catch {
    next(new Error('AUTH_INVALID'));
  }
});

// ─── Socket.IO Events ────────────────────────────────────────────────────────
io.on('connection', async (socket) => {
  const username = socket.data.username;
  console.log(`[${SERVER_ID}] + ${username} (${socket.id})`);

  // Register user presence in Redis
  await addOnlineUser(username);

  // Send last 100 messages from shared Redis history
  const history = await getMessages();
  socket.emit('chatHistory', history);

  // Broadcast join notification & updated user list to ALL nodes via adapter
  socket.broadcast.emit('userJoined', { user: username, timestamp: Date.now() });
  const usersOnJoin = await getOnlineUsers();
  io.emit('usersList', usersOnJoin);

  // On-demand user list refresh
  socket.on('requestUsers', async () => {
    const users = await getOnlineUsers();
    socket.emit('usersList', users);
  });

  // Incoming message
  socket.on('sendMessage', async (text, callback) => {
    if (!text || String(text).trim() === '') {
      return callback?.({ error: 'Message cannot be empty.' });
    }

    const message = {
      id: crypto.randomUUID(),
      user: username,
      text: String(text).trim(),
      timestamp: Date.now(),
    };

    // Persist (ephemerally) in Redis list, then broadcast via adapter
    await addMessage(message);
    io.emit('newMessage', message);

    callback?.({ success: true });
  });

  // Disconnection
  socket.on('disconnect', async () => {
    console.log(`[${SERVER_ID}] - ${username} (${socket.id})`);
    await removeOnlineUser(username);
    io.emit('userLeft', { user: username, timestamp: Date.now() });
    const usersOnLeave = await getOnlineUsers();
    io.emit('usersList', usersOnLeave);
  });
});

// ─── Startup ─────────────────────────────────────────────────────────────────
async function start() {
  try {
    await pubClient.connect();
    await subClient.connect();
    io.adapter(createAdapter(pubClient, subClient));

    httpServer.listen(PORT, () => {
      console.log(`[${SERVER_ID}] ✓ Listening on http://localhost:${PORT}`);
      console.log(`[${SERVER_ID}] ✓ Redis  → ${REDIS_URL}`);
      console.log(`[${SERVER_ID}] ✓ CORS   → ${CLIENT_ORIGIN}`);
    });
  } catch (err) {
    console.error(`[${SERVER_ID}] ✗ Failed to start:`, err.message);
    process.exit(1);
  }
}

start();

