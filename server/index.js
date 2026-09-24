import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import apiRouter from './routes/api.js';
import { initDatabase } from './db/connection.js';
import { seedDatabase } from './db/seed.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 5000;

const app = express();

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize DB and ensure seed data exists
try {
  initDatabase();
  seedDatabase();
} catch (err) {
  console.error('Error during database initialization:', err);
}

// API Routes
app.use('/api', apiRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Career Solver MVP',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Frontend Serving: Vite dev middleware in development, static files in production
async function setupFrontend() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root: path.resolve(__dirname, '..'),
    });
    app.use(vite.middlewares);
    console.log('⚡ Vite HMR middleware connected to Express server');
  } else {
    const distPath = path.resolve(__dirname, '../dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
      console.log('📦 Serving production static build from dist/');
    }
  }
}

await setupFrontend();

app.listen(PORT, () => {
  console.log(`\n=================================================`);
  console.log(`🚀 CAREER SOLVER MVP running on: http://localhost:${PORT}`);
  console.log(`🌟 AI Engine: Ready (Gemini API & Heuristic Fallback)`);
  console.log(`💾 Database: SQLite (career_solver.db) connected`);
  console.log(`👤 Demo Personas: Arun (College), Muthu (Trades), Priya (Switcher)`);
  console.log(`=================================================\n`);
});
