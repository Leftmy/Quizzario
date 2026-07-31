import { Router } from 'express';
import {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  submitQuiz,
  deleteQuiz,
} from '../controllers/quiz.controller';

const router = Router();

router.post('/', createQuiz);
router.get('/', getAllQuizzes);
router.get('/:id', getQuizById);
router.post('/:id/submit', submitQuiz);
router.delete('/:id', deleteQuiz);

export default router;
