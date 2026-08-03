import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import v1Router from './routes/v1';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// API Version 1
app.use('/api/v1', v1Router);

// Legacy / unversioned fallback alias (/api/quizzes -> /api/v1/quizzes)
app.use('/api/quizzes', (req, res, next) => {
  req.url = `/quizzes${req.url}`;
  v1Router(req, res, next);
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
