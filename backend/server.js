// backend/server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
let morgan = null;
try {
  morgan = require('morgan');
} catch (e) {
  console.warn('Optional dependency "morgan" not installed — request logging will be minimal.');
}
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const partyRoutes = require('./routes/partyRoutes');
const participantRoutes = require('./routes/participantRoutes');
const messageRoutes = require('./routes/messageRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

// Create Express app
const app = express();

// Basic middleware
const allowedOrigins = [
  process.env.CLIENT_URL,         // Render frontend URL
  "http://localhost:5173",        // dev mode
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // mobile apps / curl / same machine
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS not allowed for this origin: " + origin), false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

if (morgan) {
  app.use(morgan('dev'));
} else {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
  });
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});


// Health check
app.get('/', (req, res) =>
  res.json({ ok: true, msg: 'WatchParty backend is running 🚀' })
);

// API routes (REST)
app.use('/api/auth', authRoutes);
app.use('/api/parties', partyRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/feedback', feedbackRoutes);

// Error handler (last)
app.use(errorHandler);

// ---- HTTP + SOCKET SERVER WRAP ----
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Socket CORS blocked: " + origin), false);
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});
// Init socket logic
require('./socket/socketServer')(io);

// ---- STARTUP ----
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

async function startServer() {
  try {
    if (!MONGO_URI) {
      console.warn('MONGO_URI not set. Set it in .env to enable MongoDB.');
    } else {
      await mongoose.connect(MONGO_URI);
      console.log('✅ Connected to MongoDB');
    }

    server.listen(PORT, () => {
      console.log(`🚀 Server + Socket running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

startServer();

module.exports = { app, server, io };
