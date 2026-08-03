import { createQuiz, getQuizById, deleteQuiz } from '../controllers/quiz.controller';
import { QuizService } from '../services/quiz.service';

jest.mock('../services/quiz.service');

describe('QuizController', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('createQuiz', () => {
    it('should return 400 Bad Request if Zod validation fails', async () => {
      req.body = { title: 'Hi' };

      await createQuiz(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Validation failed' }),
      );
    });

    it('should return 201 Created on valid input', async () => {
      const validBody = {
        title: 'Valid Quiz Title',
        questions: [
          {
            type: 'BOOLEAN',
            text: 'Is Node.js single-threaded?',
            answers: ['true'],
          },
        ],
      };
      req.body = validBody;

      const createdQuiz = { id: 'uuid-1', ...validBody };
      (QuizService.createQuiz as jest.Mock).mockResolvedValue(createdQuiz);

      await createQuiz(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdQuiz);
    });
  });

  describe('getQuizById', () => {
    it('should return 404 if quiz is not found', async () => {
      req.params.id = 'missing-id';
      (QuizService.getQuizById as jest.Mock).mockResolvedValue(null);

      await getQuizById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Quiz not found' });
    });
  });

  describe('deleteQuiz', () => {
    it('should return 404 if quiz to delete is not found', async () => {
      req.params.id = 'missing-id';
      (QuizService.getQuizById as jest.Mock).mockResolvedValue(null);

      await deleteQuiz(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Quiz not found' });
    });

    it('should return 204 No Content on successful delete', async () => {
      const existingQuiz = { id: 'uuid-1', title: 'My Quiz', questions: [] };
      req.params.id = 'uuid-1';
      (QuizService.getQuizById as jest.Mock).mockResolvedValue(existingQuiz);
      (QuizService.deleteQuiz as jest.Mock).mockResolvedValue(existingQuiz);

      await deleteQuiz(req, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });
});
