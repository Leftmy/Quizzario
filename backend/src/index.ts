import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/quizzes', (req, res) => {
  res.json([]);
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});