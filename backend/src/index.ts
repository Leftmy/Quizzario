import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import quizRoutes from './routes/quiz.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/quizzes', quizRoutes);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
