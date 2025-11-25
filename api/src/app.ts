import express from "express";
import dotenv from "dotenv";
import http from "http";
import { WebSocketServer } from "ws";

import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import threadRoutes from './routes/thread';
import repliesRoutes from './routes/replies';
import corsMiddleware from './middlewares/cors';
import path from "path";

dotenv.config({ path: '../.env' });

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(corsMiddleware);

// Serve static files from uploads
const uploadsPath = path.join(__dirname, "..", "uploads");
app.use("/uploads", express.static(uploadsPath));
console.log("SERVING UPLOADS FROM:", uploadsPath);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/threads', threadRoutes);
app.use('/api/replies', repliesRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.status(500).json({ message: err.message });
});

// Buat HTTP server dari Express
const server = http.createServer(app);

// Buat WebSocket server
const wss = new WebSocketServer({ server });

import { setWss, broadcast } from './services/socketService';
setWss(wss);

wss.on("connection", (ws, req) => {
  console.log("🟢 New WebSocket client connected", req.url);

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log("📨 Received WebSocket message:", data);

      if (data.type === 'auth') {
        console.log("🔐 WebSocket client authenticated with token:", data.token);
        // For now, just accept the connection
        // In a real app, you'd verify the JWT token here
      }
    } catch (error) {
      console.log("📨 Received raw WebSocket message:", message.toString());
      // Backward compatibility - broadcast raw messages if needed
      broadcast({ type: 'message', data: message.toString() });
    }
  });

  ws.on("close", () => {
    console.log("🔴 Client disconnected");
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

// Jalankan server HTTP + WebSocket
server.listen(port, () => {
  console.log(`Server running on port ${port} (HTTP + WS)`);
});

export default app;