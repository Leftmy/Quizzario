'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';
import { Quiz, QuizResult } from '@/types/quiz';

export default function QuizPlayerPage() {
  const params = useParams();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  const [result, setResult] = useState<QuizResult | null>(null);
  const [isPlayMode, setIsPlayMode] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const data = await api.getQuizById(quizId);
        setQuiz(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    if (quizId) fetchQuiz();
  }, [quizId]);

  const handleSingleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleCheckboxAnswer = (questionId: string, option: string) => {
    setAnswers((prev) => {
      const current = (prev[questionId] as string[]) || [];
      const updated = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];
      return { ...prev, [questionId]: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      const res = await api.submitQuiz(quizId, { answers });
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to submit quiz answers');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-4 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/2 mb-6"></div>
        <div className="h-32 bg-slate-800/60 rounded-2xl border border-slate-700"></div>
        <div className="h-32 bg-slate-800/60 rounded-2xl border border-slate-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="p-4 bg-red-950/60 text-red-200 rounded-xl border border-red-800 mb-4">
          {error}
        </div>
        <Link href="/quizzes" className="text-emerald-400 font-semibold hover:underline">
          ← Back to Quizzes
        </Link>
      </div>
    );
  }

  if (!quiz) return null;

  if (result) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-6 text-slate-100">
        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center shadow-xl space-y-4">
          <h1 className="text-3xl font-bold text-white">Quiz Completed!</h1>

          <div className="inline-block p-6 bg-emerald-500/10 rounded-full my-2 border border-emerald-500/20">
            <span className="text-5xl font-extrabold text-emerald-400">{result.score}%</span>
          </div>

          <p className="text-lg text-slate-300">
            You answered <span className="font-bold text-white">{result.correctCount}</span> out of{' '}
            <span className="font-bold text-white">{result.totalQuestions}</span> questions
            correctly.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Review Answers</h2>
          {quiz.questions.map((q, idx) => {
            const detail = result.details.find((d) => d.questionId === q.id);
            const isCorrect = detail?.isCorrect;

            return (
              <div
                key={q.id || idx}
                className={`p-6 rounded-2xl border ${
                  isCorrect
                    ? 'bg-emerald-950/30 border-emerald-800/50'
                    : 'bg-red-950/30 border-red-800/50'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block mb-1">
                      Question #{idx + 1} ({q.type})
                    </span>
                    <h3 className="font-bold text-white text-lg">{q.text}</h3>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isCorrect
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}
                  >
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700/60 text-sm space-y-1">
                  <p className="text-slate-300">
                    <span className="font-semibold text-white">Your Answer: </span>
                    {Array.isArray(detail?.userAnswer)
                      ? detail?.userAnswer.join(', ') || 'None'
                      : detail?.userAnswer || 'None'}
                  </p>
                  {!isCorrect && (
                    <p className="text-emerald-400 font-medium">
                      <span className="font-semibold text-white">Correct Answer(s): </span>
                      {detail?.correctAnswers.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center pt-4">
          <Link
            href="/quizzes"
            className="px-6 py-2.5 bg-slate-800 text-slate-200 font-semibold rounded-xl hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            All Quizzes
          </Link>
          <button
            onClick={() => {
              setResult(null);
              setAnswers({});
            }}
            className="px-6 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!isPlayMode) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-8 text-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700 pb-6">
          <div>
            <Link
              href="/quizzes"
              className="text-sm font-semibold text-emerald-400 hover:underline"
            >
              ← Back to Quizzes
            </Link>
            <h1 className="text-3xl font-bold text-white mt-2">{quiz.title}</h1>
            <p className="text-slate-400 text-sm mt-1">Read-only structural preview of the quiz.</p>
          </div>
          <button
            onClick={() => setIsPlayMode(true)}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
          >
            Play Quiz
          </button>
        </div>

        <div className="space-y-6">
          {quiz.questions.map((q, idx) => (
            <div
              key={q.id || idx}
              className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Question {idx + 1} of {quiz.questions.length}
                </span>
                <span className="text-xs bg-slate-800 text-emerald-400 px-2.5 py-1 rounded font-semibold border border-slate-700">
                  {q.type}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white">{q.text}</h3>

              {/* BOOLEAN */}
              {q.type === 'BOOLEAN' && (
                <div className="flex gap-4 pt-2">
                  {['true', 'false'].map((val) => (
                    <div
                      key={val}
                      className="flex-1 p-3 border border-slate-700 bg-slate-800/60 text-slate-300 rounded-xl text-center font-medium capitalize cursor-not-allowed"
                    >
                      <span>{val}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* INPUT */}
              {q.type === 'INPUT' && (
                <div className="pt-2">
                  <div className="w-full border border-slate-700 bg-slate-800/60 rounded-xl p-3 text-sm text-slate-400 flex items-center gap-2 cursor-not-allowed">
                    <svg
                      className="w-4 h-4 text-slate-400 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    Short text answer field
                  </div>
                </div>
              )}

              {/* CHECKBOX */}
              {q.type === 'CHECKBOX' && (
                <div className="space-y-2 pt-2">
                  {q.options?.map((opt) => (
                    <div
                      key={opt}
                      className="flex items-center p-3 border border-slate-700 bg-slate-800/60 rounded-xl text-sm font-medium text-slate-300 cursor-not-allowed"
                    >
                      <input
                        type="checkbox"
                        disabled
                        className="w-4 h-4 text-slate-500 rounded mr-3 cursor-not-allowed"
                      />
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700 pb-6">
        <div>
          <button
            onClick={() => setIsPlayMode(false)}
            className="text-sm font-semibold text-emerald-400 hover:underline"
          >
            ← Back to Preview
          </button>
          <h1 className="text-3xl font-bold text-white mt-2">{quiz.title}</h1>
          <p className="text-slate-400 text-sm mt-1">
            Answer all questions below and submit your quiz.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {quiz.questions.map((q, idx) => {
          const qId = q.id!;

          return (
            <div
              key={qId || idx}
              className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Question {idx + 1} of {quiz.questions.length}
                </span>
                <span className="text-xs bg-slate-800 text-emerald-400 px-2.5 py-1 rounded font-semibold border border-slate-700">
                  {q.type}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white">{q.text}</h3>

              {/* BOOLEAN */}
              {q.type === 'BOOLEAN' && (
                <div className="flex gap-4 pt-2">
                  {['true', 'false'].map((val) => (
                    <label
                      key={val}
                      className={`flex-1 p-3.5 border rounded-xl cursor-pointer text-center font-medium capitalize transition-all ${
                        answers[qId] === val
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold shadow-sm'
                          : 'border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name={qId}
                        value={val}
                        checked={answers[qId] === val}
                        onChange={(e) => handleSingleAnswer(qId, e.target.value)}
                        className="sr-only"
                      />
                      <span>{val}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* INPUT */}
              {q.type === 'INPUT' && (
                <div className="pt-2">
                  <input
                    type="text"
                    className="w-full border border-slate-700 bg-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    placeholder="Type your answer here..."
                    value={(answers[qId] as string) || ''}
                    onChange={(e) => handleSingleAnswer(qId, e.target.value)}
                  />
                </div>
              )}

              {/* CHECKBOX */}
              {q.type === 'CHECKBOX' && (
                <div className="space-y-2 pt-2">
                  {q.options?.map((opt) => {
                    const currentAnswers = (answers[qId] as string[]) || [];
                    const isChecked = currentAnswers.includes(opt);

                    return (
                      <label
                        key={opt}
                        className={`flex items-center p-3.5 border rounded-xl cursor-pointer text-sm font-medium transition-all ${
                          isChecked
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold shadow-sm'
                            : 'border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCheckboxAnswer(qId, opt)}
                          className="w-4 h-4 text-emerald-500 rounded mr-3 focus:ring-emerald-500/20 bg-slate-800 border-slate-700"
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 bg-emerald-500 text-slate-950 font-bold rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Answers'}
          </button>
        </div>
      </form>
    </div>
  );
}
