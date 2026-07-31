'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';

interface QuizItem {
  id: string;
  title: string;
  createdAt: string;
  _count: {
    questions: number;
  };
}

interface DeleteTarget {
  id: string;
  title: string;
}

export default function QuizzesListPage() {
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const data = await api.getQuizzes();
        setQuizzes(data as unknown as QuizItem[]);
      } catch (err: any) {
        setError(err.message || 'Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setDeleting(true);
      await api.deleteQuiz(deleteTarget.id);
      setQuizzes((prev) => prev.filter((q) => q.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete quiz');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Available Quizzes</h1>
          <p className="text-slate-300 mt-1">
            Select a quiz to test your knowledge or create a new one.
          </p>
        </div>
        <Link
          href="/create"
          className="inline-flex items-center justify-center px-5 py-2.5 bg-emerald-500 text-slate-950 font-semibold rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
        >
          + Create New Quiz
        </Link>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-slate-800 rounded-xl border border-slate-700" />
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-950/60 text-red-200 rounded-xl border border-red-800">
          {error}
        </div>
      )}

      {!loading && !error && quizzes.length === 0 && (
        <div className="text-center py-12 bg-slate-900 rounded-2xl border border-dashed border-slate-700">
          <h3 className="text-lg font-medium text-white mb-2">No quizzes found</h3>
          <p className="text-slate-400 mb-6">Be the first to create a quiz!</p>
          <Link
            href="/create"
            className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-semibold rounded-xl hover:bg-emerald-400"
          >
            Create Quiz
          </Link>
        </div>
      )}

      {!loading && !error && quizzes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-slate-900 p-6 rounded-xl border border-slate-700 shadow-lg shadow-slate-950/30 hover:border-emerald-500/60 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h2 className="text-xl font-bold text-white line-clamp-2">{quiz.title}</h2>
                  <button
                    onClick={() => setDeleteTarget({ id: quiz.id, title: quiz.title })}
                    className="text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10 shrink-0"
                    aria-label="Delete quiz"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium text-slate-300 mb-6">
                  <span className="bg-emerald-500/10 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-500/20">
                    {quiz._count.questions} {quiz._count.questions === 1 ? 'Question' : 'Questions'}
                  </span>
                  <span>Created {new Date(quiz.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <Link
                href={`/quizzes/${quiz.id}`}
                className="w-full inline-flex justify-center items-center py-2.5 px-4 bg-slate-800 text-white font-semibold rounded-lg hover:bg-emerald-500 hover:text-slate-950 transition-colors text-sm border border-slate-700"
              >
                View Quiz Details
              </Link>
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
          <div
            className="absolute inset-0"
            onClick={() => setDeleteTarget(null)}
            aria-label="Close delete confirmation"
          />

          <div
            className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl shadow-slate-950/60"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-white">Delete quiz?</h2>
            <p className="mt-2 text-sm text-slate-300">
              This action will permanently remove{' '}
              <span className="font-semibold text-white">{deleteTarget.title}</span>.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
