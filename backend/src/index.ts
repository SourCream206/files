import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createTables } from './db/schema';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import careerFairRoutes from './routes/careerFair';
import networkingRoutes from './routes/networking';
import followUpRoutes from './routes/followUp';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*', credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'fair-game-backend' });
});


app.get('/', (req, res) => {
  res.send('Fair Game API is running 🚀');
});

app.get('/api', (req, res) => {
  res.json({ message: 'API is working 🚀' });
});

app.get('/api/auth', (req, res) => {
  res.json({ message: 'Auth route working 🔐' });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/career-fair', careerFairRoutes);
app.use('/api/networking', networkingRoutes);
app.use('/api/generate-followup', followUpRoutes);

const port = process.env.PORT || 4000;

createTables()
  .then(() => {
    app.listen(port, () => {
      console.log(`Fair Game API listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

