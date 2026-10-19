import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Standard Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Basic Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: PORT,
  });
});

// Admin Passcode Verification Endpoint
app.post('/api/auth/admin-verify', (req: Request, res: Response) => {
  const { passcode } = req.body;
  if (!passcode) {
    return res.status(400).json({ success: false, error: 'Passcode is required' });
  }

  // Passcode 1: Content Manager
  if (passcode === '9989032137') {
    return res.json({
      success: true,
      role: 'content_manager',
      levelName: 'Content Manager (Edit & Upload Mode)',
      canDelete: false,
      adminToken: 'token_mgr_' + Date.now().toString(36),
    });
  }

  // Passcode 2: Super Admin
  if (passcode === '9492335119') {
    return res.json({
      success: true,
      role: 'admin',
      levelName: 'Super Administrator (Full Master Control)',
      canDelete: true,
      adminToken: 'token_super_' + Date.now().toString(36),
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Incorrect admin passcode. Access denied.',
  });
});

// Serve frontend assets or mount Vite in development
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Express Server] Vite middlewares mounted in dev mode');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('[Express Server] Serving production build from:', distPath);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Express Server] Server running on http://0.0.0.0:${PORT}`);
  });
}

// Start server if executed directly
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
