import { Quiz, CreateQuizInput, QuizSubmission, QuizResult } from '@/types/quiz';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    let errorMessage = `Server error (${res.status}): ${res.statusText}`;

    try {
      const data = JSON.parse(text);
      errorMessage = data.error || data.message || errorMessage;
    } catch {
      console.error(`[API Error ${res.status}]:`, text);
    }

    throw new Error(errorMessage);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

export const api = {
  async getQuizzes(): Promise<Quiz[]> {
    const res = await fetch(`${API_URL}/quizzes`);
    return handleResponse<Quiz[]>(res);
  },

  async getQuizById(id: string): Promise<Quiz> {
    const res = await fetch(`${API_URL}/quizzes/${id}`);
    return handleResponse<Quiz>(res);
  },

  async createQuiz(data: CreateQuizInput): Promise<Quiz> {
    const res = await fetch(`${API_URL}/quizzes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Quiz>(res);
  },

  async submitQuiz(id: string, submission: QuizSubmission): Promise<QuizResult> {
    const res = await fetch(`${API_URL}/quizzes/${id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
    });
    return handleResponse<QuizResult>(res);
  },

  async deleteQuiz(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/quizzes/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(res);
  },
};
