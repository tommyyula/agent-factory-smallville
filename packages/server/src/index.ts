import express from 'express';
import cors from 'cors';

const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/status', (req, res) => {
  res.json({
    message: 'Agent Factory Smallville API',
    timestamp: new Date().toISOString(),
    agents: { total: 8, active: 6, idle: 2 },
    system: { status: 'operational', load: 0.25 }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});