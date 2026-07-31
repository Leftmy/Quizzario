'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { Question, QuestionType } from '@/types/quiz';

export default function CreateQuizPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([
    { type: 'BOOLEAN', text: '', answers: ['true'] },
  ]);

  const addQuestion = () => {
    setQuestions([...questions, { type: 'BOOLEAN', text: '', answers: ['true'] }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleTypeChange = (index: number, newType: QuestionType) => {
    const updated = [...questions];
    if (newType === 'BOOLEAN') {
      updated[index] = { type: 'BOOLEAN', text: updated[index].text, answers: ['true'] };
    } else if (newType === 'INPUT') {
      updated[index] = { type: 'INPUT', text: updated[index].text, answers: [''] };
    } else if (newType === 'CHECKBOX') {
      updated[index] = {
        type: 'CHECKBOX',
        text: updated[index].text,
        options: ['Option 1', 'Option 2'],
        answers: [],
      };
    }
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx: number, oIdx: number, val: string) => {
    const updated = [...questions];
    if (updated[qIdx].options) {
      const oldVal = updated[qIdx].options![oIdx];
      updated[qIdx].options![oIdx] = val;

      const answerIndex = updated[qIdx].answers.indexOf(oldVal);
      if (answerIndex !== -1) {
        updated[qIdx].answers[answerIndex] = val;
      }
    }
    setQuestions(updated);
  };

  const addOption = (qIdx: number) => {
    const updated = [...questions];
    if (updated[qIdx].options) {
      updated[qIdx].options!.push(`Option ${updated[qIdx].options!.length + 1}`);
    }
    setQuestions(updated);
  };

  const toggleAnswerCheckbox = (qIdx: number, optionVal: string) => {
    const updated = [...questions];
    const current = updated[qIdx].answers;
    if (current.includes(optionVal)) {
      updated[qIdx].answers = current.filter((a) => a !== optionVal);
    } else {
      updated[qIdx].answers = [...current, optionVal];
    }
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setSubmitting(true);
      await api.createQuiz({ title, questions });
      router.push('/quizzes');
    } catch (err: any) {
      setError(err.message || 'Failed to create quiz');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 text-slate-100">
      <h1 className="text-3xl font-bold text-white">Create New Quiz</h1>

      {error && (
        <div className="p-4 bg-red-950/60 text-red-200 rounded-xl border border-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <label className="block text-sm font-semibold mb-2 text-slate-200">Quiz Title</label>
          <input
            type="text"
            className="w-full border border-slate-700 bg-slate-800 text-white rounded-xl p-3 text-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder-slate-500"
            placeholder="e.g., General Knowledge Quiz"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Dynamic Questions List */}
        <div className="space-y-4">
          {questions.map((q, qIndex) => (
            <div
              key={qIndex}
              className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="font-bold text-white">Question #{qIndex + 1}</span>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="text-red-400 hover:text-red-300 font-medium text-sm transition-colors"
                  >
                    Delete Question
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Text</label>
                  <input
                    type="text"
                    className="w-full border border-slate-700 bg-slate-800 text-white rounded-xl p-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder-slate-500"
                    placeholder="Enter question text..."
                    value={q.text}
                    onChange={(e) => {
                      const updated = [...questions];
                      updated[qIndex].text = e.target.value;
                      setQuestions(updated);
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Type</label>
                  <select
                    className="w-full border border-slate-700 bg-slate-800 text-white rounded-xl p-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    value={q.type}
                    onChange={(e) => handleTypeChange(qIndex, e.target.value as QuestionType)}
                  >
                    <option value="BOOLEAN">Boolean (True/False)</option>
                    <option value="INPUT">Short Text Input</option>
                    <option value="CHECKBOX">Multiple Choice</option>
                  </select>
                </div>
              </div>

              {/* Render Type Specific Answer Controls */}
              <div className="pt-2">
                {q.type === 'BOOLEAN' && (
                  <div className="flex gap-6 items-center bg-slate-800/60 p-4 rounded-xl border border-slate-800">
                    <span className="text-sm font-medium text-slate-300">Correct Answer:</span>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-200 hover:text-white">
                      <input
                        type="radio"
                        name={`bool-${qIndex}`}
                        checked={q.answers[0] === 'true'}
                        onChange={() => {
                          const updated = [...questions];
                          updated[qIndex].answers = ['true'];
                          setQuestions(updated);
                        }}
                        className="text-emerald-500 focus:ring-emerald-500/20"
                      />
                      True
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-200 hover:text-white">
                      <input
                        type="radio"
                        name={`bool-${qIndex}`}
                        checked={q.answers[0] === 'false'}
                        onChange={() => {
                          const updated = [...questions];
                          updated[qIndex].answers = ['false'];
                          setQuestions(updated);
                        }}
                        className="text-emerald-500 focus:ring-emerald-500/20"
                      />
                      False
                    </label>
                  </div>
                )}

                {q.type === 'INPUT' && (
                  <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-800">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Expected Answer
                    </label>
                    <input
                      type="text"
                      className="w-full border border-slate-700 bg-slate-800 text-white rounded-xl p-2.5 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      placeholder="e.g., Paris"
                      value={q.answers[0] || ''}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[qIndex].answers = [e.target.value];
                        setQuestions(updated);
                      }}
                      required
                    />
                  </div>
                )}

                {q.type === 'CHECKBOX' && (
                  <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-800 space-y-3">
                    <span className="text-sm font-medium text-slate-300 block">
                      Options (Check boxes that represent correct answers):
                    </span>
                    {q.options?.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={q.answers.includes(opt)}
                          onChange={() => toggleAnswerCheckbox(qIndex, opt)}
                          className="w-4 h-4 text-emerald-500 rounded border-slate-700 bg-slate-800 focus:ring-emerald-500/20"
                        />
                        <input
                          type="text"
                          className="flex-1 border border-slate-700 bg-slate-800 text-white rounded-xl p-2.5 text-sm placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                          value={opt}
                          onChange={(e) => handleOptionChange(qIndex, oIdx, e.target.value)}
                          required
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addOption(qIndex)}
                      className="text-sm text-emerald-400 font-semibold hover:underline pt-1 block"
                    >
                      + Add Option
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4">
          <button
            type="button"
            onClick={addQuestion}
            className="px-5 py-2.5 border border-slate-700 bg-slate-800 text-slate-200 font-semibold rounded-xl hover:bg-slate-700 transition-colors"
          >
            + Add Question
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Save Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
}
