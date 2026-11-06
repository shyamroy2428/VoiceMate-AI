import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import chatRoutes from './routes/chat.js';
import speechRoutes from './routes/speech.js';
import ttsRoutes from './routes/tts.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { getServiceStatus } from './services/gnaniService.js';
import multer from 'multer';

const app = express();
const port = Number(process.env.PORT) || 4000;
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', services: getServiceStatus() }));
app.use('/api/chat', chatRoutes);
app.use('/api/speech-to-text', speechRoutes);
app.use('/api/text-to-speech', ttsRoutes);
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => console.log(`VoiceMate API listening on http://localhost:${port}`));
