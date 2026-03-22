import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import voiceRouter from './routes/voice.js';
import videoRouter from './routes/video.js';

const app = express();
const PORT = process.env.API_PORT ?? 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/voice', voiceRouter);
app.use('/api/video', videoRouter);

const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`[api] Express server running on http://localhost:${PORT}`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[api] Port ${PORT} is already in use. Kill the old process or set a different API_PORT in .env`);
  } else {
    console.error('[api] Server error:', err.message);
  }
  process.exit(1);
});
