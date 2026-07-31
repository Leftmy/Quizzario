import { Request, Response } from 'express';
import { QuizService } from '../services/quiz.service';
import { createQuizSchema, submitQuizSchema } from '../validators/quiz.schema';

export const createQuiz = async (req: Request, res: Response) => {
  try {
    const validatedData = createQuizSchema.parse(req.body);
    const quiz = await QuizService.createQuiz(validatedData);
    res.status(201).json(quiz);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
    res.status(500).json({ error: 'Failed to create quiz' });
  }
};

export const getAllQuizzes = async (_req: Request, res: Response) => {
  try {
    const quizzes = await QuizService.getAllQuizzes();
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
};

export const getQuizById = async (req: Request, res: Response) => {
  try {
    const quiz = await QuizService.getQuizById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
};

export const submitQuiz = async (req: Request, res: Response) => {
  try {
    const validatedInput = submitQuizSchema.parse(req.body);
    const result = await QuizService.submitQuiz(req.params.id, validatedInput);

    if (!result) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json(result);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
};

export const deleteQuiz = async (req: Request, res: Response) => {
  try {
    const quiz = await QuizService.getQuizById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    await QuizService.deleteQuiz(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
};
