import { QuizService } from '../services/quiz.service';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client', () => {
  const mPrisma = {
    quiz: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrisma) };
});

const prisma = new PrismaClient() as jest.Mocked<any>;

describe('QuizService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('submitQuiz', () => {
    it('should return null if quiz is not found', async () => {
      prisma.quiz.findUnique.mockResolvedValue(null);

      const result = await QuizService.submitQuiz('non-existent-id', { answers: {} });
      expect(result).toBeNull();
    });

    it('should correctly evaluate BOOLEAN, INPUT and CHECKBOX questions', async () => {
      const mockQuiz = {
        id: 'quiz-1',
        title: 'Test Quiz',
        questions: [
          {
            id: 'q1',
            type: 'BOOLEAN',
            text: 'Is sky blue?',
            answers: JSON.stringify(['true']),
          },
          {
            id: 'q2',
            type: 'INPUT',
            text: 'Capital of France?',
            answers: JSON.stringify(['Paris']),
          },
          {
            id: 'q3',
            type: 'CHECKBOX',
            text: 'Select even numbers',
            options: JSON.stringify(['1', '2', '4', '5']),
            answers: JSON.stringify(['2', '4']),
          },
        ],
      };

      prisma.quiz.findUnique.mockResolvedValue(mockQuiz);

      const userInput = {
        answers: {
          q1: 'TRUE ',
          q2: 'paris',
          q3: ['4', '2'],
        },
      };

      const result = await QuizService.submitQuiz('quiz-1', userInput);

      expect(result).not.toBeNull();
      expect(result?.correctCount).toBe(3);
      expect(result?.score).toBe(100);
      expect(result?.details).toHaveLength(3);
      expect(result?.details.every((d) => d.isCorrect)).toBe(true);
    });

    it('should calculate partial score correctly when some answers are wrong', async () => {
      const mockQuiz = {
        id: 'quiz-1',
        questions: [
          {
            id: 'q1',
            type: 'BOOLEAN',
            answers: JSON.stringify(['true']),
          },
          {
            id: 'q2',
            type: 'BOOLEAN',
            answers: JSON.stringify(['false']),
          },
        ],
      };

      prisma.quiz.findUnique.mockResolvedValue(mockQuiz);

      const userInput = {
        answers: {
          q1: 'true',
          q2: 'true',
        },
      };

      const result = await QuizService.submitQuiz('quiz-1', userInput);

      expect(result?.correctCount).toBe(1);
      expect(result?.totalQuestions).toBe(2);
      expect(result?.score).toBe(50);
    });
  });

  describe('getQuizById', () => {
    it('should parse options JSON string into an array for CHECKBOX questions', async () => {
      const mockQuiz = {
        id: 'quiz-1',
        title: 'Sample',
        questions: [
          {
            id: 'q1',
            type: 'CHECKBOX',
            text: 'Choose',
            options: JSON.stringify(['Option A', 'Option B']),
          },
        ],
      };

      prisma.quiz.findUnique.mockResolvedValue(mockQuiz);

      const result = await QuizService.getQuizById('quiz-1');

      expect(result?.questions[0].options).toEqual(['Option A', 'Option B']);
    });
  });
});
