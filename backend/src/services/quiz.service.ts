import { PrismaClient } from '@prisma/client';
import { CreateQuizInput, SubmitQuizInput } from '../validators/quiz.schema';

const prisma = new PrismaClient();

export class QuizService {
  static async createQuiz(data: CreateQuizInput) {
    return prisma.quiz.create({
      data: {
        title: data.title,
        questions: {
          create: data.questions.map((q) => ({
            type: q.type,
            text: q.text,
            options: q.type === 'CHECKBOX' ? JSON.stringify(q.options) : null,
            answers: JSON.stringify(q.answers),
          })),
        },
      },
      include: {
        questions: true,
      },
    });
  }

  static async getAllQuizzes() {
    return prisma.quiz.findMany({
      select: {
        id: true,
        title: true,
        createdAt: true,
        _count: {
          select: { questions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getQuizById(id: string) {
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          select: {
            id: true,
            type: true,
            text: true,
            options: true,
          },
        },
      },
    });

    if (!quiz) return null;

    return {
      ...quiz,
      questions: quiz.questions.map((q) => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : null,
      })),
    };
  }

  static async submitQuiz(quizId: string, input: SubmitQuizInput) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!quiz) return null;

    let correctCount = 0;
    const totalQuestions = quiz.questions.length;

    const results = quiz.questions.map((q) => {
      const correctAnswers: string[] = JSON.parse(q.answers);
      const userAnswer = input.answers[q.id];
      let isCorrect = false;

      if (q.type === 'BOOLEAN' || q.type === 'INPUT') {
        const formattedUserAns =
          typeof userAnswer === 'string' ? userAnswer.trim().toLowerCase() : '';
        const formattedCorrectAns = correctAnswers[0].trim().toLowerCase();
        isCorrect = formattedUserAns === formattedCorrectAns;
      } else if (q.type === 'CHECKBOX') {
        const userAnsArray = Array.isArray(userAnswer) ? userAnswer.sort() : [];
        const sortedCorrect = [...correctAnswers].sort();

        isCorrect =
          userAnsArray.length === sortedCorrect.length &&
          userAnsArray.every((val, index) => val === sortedCorrect[index]);
      }

      if (isCorrect) correctCount++;

      return {
        questionId: q.id,
        isCorrect,
        correctAnswers,
        userAnswer: userAnswer || null,
      };
    });

    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

    return {
      score: scorePercentage,
      correctCount,
      totalQuestions,
      details: results,
    };
  }

  static async deleteQuiz(id: string) {
    return prisma.quiz.delete({
      where: { id },
    });
  }
}
