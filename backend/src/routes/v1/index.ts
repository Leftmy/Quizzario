import { Router } from 'express';
import quizRoutes from './quiz.routes';

const v1Router = Router();

v1Router.use('/quizzes', quizRoutes);

export default v1Router;
