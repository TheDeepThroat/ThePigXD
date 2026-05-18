import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env from this file's directory regardless of CWD
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '.env') });

import express        from 'express';
import { createServer } from 'http';
import { Server }     from 'socket.io';
import cors           from 'cors';
import cookieParser   from 'cookie-parser';
import { createClient } from 'redis';
import { randomUUID } from 'crypto';

// ─── Config ───────────────────────────────────────────────────────────────────
const PORT            = process.env.PORT            || 4000;
const REDIS_URL       = process.env.REDIS_URL       || 'redis://localhost:6379';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const SERVER_ID       = process.env.SERVER_ID       || 'srv-1';

// ─── Three Redis clients (subscriber cannot share with commander clients) ─────
const publisher   = createClient({ url: REDIS_URL });
const subscriber  = publisher.duplicate();
const sessionStore = publisher.duplicate();

publisher.on('error',    (e) => console.error(`[${SERVER_ID}] publisher error:`,    e.message));
subscriber.on('error',   (e) => console.error(`[${SERVER_ID}] subscriber error:`,   e.message));
sessionStore.on('error', (e) => console.error(`[${SERVER_ID}] sessionStore error:`, e.message));

// ─── Express + Socket.IO ──────────────────────────────────────────────────────
const app        = express();
const httpServer = createServer(app);

const corsOptions = { origin: FRONTEND_ORIGIN, credentials: true };

const io = new Server(httpServer, { cors: corsOptions });

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// ─── Session helper ───────────────────────────────────────────────────────────
async function getSessionUsername(sid) {
  if (!sid) return null;
  return sessionStore.get(`session:${sid}`); // null if missing / expired
}

// ─── HTTP Routes ──────────────────────────────────────────────────────────────

// POST /login  →  create session in Redis + set HttpOnly cookie
app.post('/login', async (req, res) => {
  const raw = req.body?.username ?? '';
  const username = String(raw).trim();
  console.log(`[${SERVER_ID}] Login request for: ${username}`);

  if (!username) {
    return res.status(400).json({ error: 'username requerido' });
  }

  const sid = randomUUID();
  await sessionStore.set(`session:${sid}`, username, { EX: 3600 });

  res.cookie('sid', sid, {
    httpOnly: true,
    sameSite: 'lax',
    secure:   false,   // true in production (HTTPS)
    maxAge:   3_600_000,
  });

  res.json({ username, server: SERVER_ID });
});

// GET /me  →  verify session from cookie
app.get('/me', async (req, res) => {
  const username = await getSessionUsername(req.cookies.sid);
  if (!username) return res.status(401).json({ error: 'sin sesión' });
  res.json({ username, server: SERVER_ID });
});

// POST /logout  →  delete session + clear cookie
app.post('/logout', async (req, res) => {
  const { sid } = req.cookies;
  if (sid) await sessionStore.del(`session:${sid}`);
  res.clearCookie('sid');
  res.json({ ok: true });
});

// GET /messages  →  return chat history (requires session)
app.get('/messages', async (req, res) => {
  const username = await getSessionUsername(req.cookies.sid);
  if (!username) return res.status(401).json({ error: 'sin sesión' });

  const raw      = await publisher.lRange('chat:history', 0, -1);
  const messages = raw.map((m) => JSON.parse(m));
  res.json(messages);
});

// GET /health
app.get('/health', (_req, res) => {
  res.json({ ok: true, server: SERVER_ID });
});

// ─── Socket.IO Middleware: authenticate via sid cookie ────────────────────────
io.use(async (socket, next) => {
  const cookieHeader = socket.handshake.headers.cookie || '';
  const match        = cookieHeader.match(/(?:^|; )sid=([^;]+)/);

  if (!match) {
    return next(new Error('sin cookie de sesión'));
  }

  const sid      = match[1];
  const username = await sessionStore.get(`session:${sid}`);

  if (!username) {
    return next(new Error('sesión inválida o expirada'));
  }

  socket.data.username = username;
  socket.data.sid      = sid;
  next();
});

// ─── Socket.IO Events ────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  const { username } = socket.data;
  console.log(`[${SERVER_ID}] + ${username} (${socket.id})`);

  // Greet the connecting client with server identity
  socket.emit('hello', { server: SERVER_ID });

  socket.on('message', async ({ text } = {}) => {
    if (!text || !String(text).trim()) return;

    const msg = {
      id:        randomUUID(),
      username,
      text:      String(text).trim().slice(0, 500),
      timestamp: Date.now(),
      origin:    SERVER_ID,
    };

    // Persist in shared Redis history
    await publisher.rPush('chat:history', JSON.stringify(msg));
    await publisher.lTrim('chat:history', -100, -1);

    // Publish so ALL instances (ours + friend's) receive and broadcast
    await publisher.publish('chat:messages', JSON.stringify(msg));
    // NOTE: Do NOT call io.emit here.
    //       The subscriber below handles the local broadcast,
    //       ensuring both instances emit exactly once to their clients.
  });

  socket.on('disconnect', () => {
    console.log(`[${SERVER_ID}] - ${username} (${socket.id})`);
  });
});

// ─── Startup ─────────────────────────────────────────────────────────────────
async function start() {
  await publisher.connect();
  await subscriber.connect();
  await sessionStore.connect();

  // Subscribe to the shared pub/sub channel and broadcast to local WS clients
  await subscriber.subscribe('chat:messages', (raw) => {
    try {
      io.emit('message', JSON.parse(raw));
    } catch (e) {
      console.error(`[${SERVER_ID}] Malformed message on channel:`, e.message);
    }
  });

  httpServer.listen(PORT, () => {
    console.log(`[${SERVER_ID}] ✓ http://localhost:${PORT}`);
    console.log(`[${SERVER_ID}] ✓ Redis  → ${REDIS_URL}`);
    console.log(`[${SERVER_ID}] ✓ CORS   → ${FRONTEND_ORIGIN}`);
  });
}

// ─── Graceful shutdown ────────────────────────────────────────────────────────
async function shutdown(signal) {
  console.log(`\n[${SERVER_ID}] ${signal} received — shutting down…`);
  httpServer.close();
  await Promise.allSettled([
    publisher.quit(),
    subscriber.quit(),
    sessionStore.quit(),
  ]);
  process.exit(0);
}

process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start().catch((err) => {
  console.error(`[${SERVER_ID}] Startup failed:`, err.message);
  process.exit(1);
});
