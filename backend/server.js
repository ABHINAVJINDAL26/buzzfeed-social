const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');
const dotenv     = require('dotenv');
const connectDB  = require('./config/db');

dotenv.config();

const app    = express();
const server = http.createServer(app);
// Allow any localhost port during development
const allowedOrigin = (origin, callback) => {
  if (!origin || /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
    callback(null, true);
  } else if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
};

const io = new Server(server, {
  cors: { origin: allowedOrigin, credentials: true }
});

// Middleware
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json({ limit: '2mb' }));


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/posts',   require('./routes/posts'));
app.use('/api/points',  require('./routes/points'));
app.use('/api/wallet',  require('./routes/wallet'));
app.use('/api/friends', require('./routes/friends'));
app.use('/api/follow',  require('./routes/follow'));
app.use('/api/stories', require('./routes/stories'));
app.use('/api/users',   require('./routes/users'));


// Socket.io
require('./socket')(io);

const startServer = async () => {
  try {
    await connectDB();
    const port = process.env.PORT || 5000;
    server.listen(port, () => {
      console.log(`Backend running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();
