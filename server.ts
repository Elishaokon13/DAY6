import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Express backend is running.' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
}); 