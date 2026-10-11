import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { db } from './server/config/db';
import studentRoutes from './server/routes/studentRoutes';
import subjectRoutes from './server/routes/subjectRoutes';
import marksRoutes from './server/routes/marksRoutes';
import dashboardRoutes from './server/routes/dashboardRoutes';
import systemRoutes from './server/routes/systemRoutes';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Try MongoDB connection asynchronously in background if configured
if (process.env.MONGODB_URI) {
  db.connectMongoDB().catch((err) => {
    console.warn('Initial MongoDB connection attempt error:', err?.message || err);
  });
}

// Backend API Routes
app.use('/api/students', studentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/system', systemRoutes);
app.use('/api', systemRoutes); // Aliases: /api/db/status, /api/db/seed, /api/auth/login

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'BYTE XL — Student Academic Portal API',
    timestamp: new Date().toISOString(),
    db: db.getStatus(),
  });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted successfully in development mode.');
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 BYTE XL Academic Portal server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Fatal server startup error:', error);
  process.exit(1);
});
