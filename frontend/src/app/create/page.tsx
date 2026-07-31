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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Create New Quiz</h1>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <label className="block text-sm font-semibold mb-2 text-gray-700">Quiz Title</label>
          <input
            type="text"
            className="w-full border rounded-lg p-3 text-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g., General Knowledge Quiz"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Dynamic Questions List */}
        <div className="space-y-4">
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <span className="font-bold text-gray-700">Question #{qIndex + 1}</span>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="text-red-500 hover:text-red-700 font-medium text-sm"
                  >
                    Delete Question
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Text</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
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
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Type</label>
                  <select
                    className="w-full border rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
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
                  <div className="flex gap-6 items-center bg-gray-50 p-3 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">Correct Answer:</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`bool-${qIndex}`}
                        checked={q.answers[0] === 'true'}
                        onChange={() => {
                          const updated = [...questions];
                          updated[qIndex].answers = ['true'];
                          setQuestions(updated);
                        }}
                      />
                      True
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`bool-${qIndex}`}
                        checked={q.answers[0] === 'false'}
                        onChange={() => {
                          const updated = [...questions];
                          updated[qIndex].answers = ['false'];
                          setQuestions(updated);
                        }}
                      />
                      False
                    </label>
                  </div>
                )}

                {q.type === 'INPUT' && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Expected Answer
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded-lg p-2 bg-white"
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
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <span className="text-sm font-medium text-gray-600 block">
                      Options (Check boxes that represent correct answers):
                    </span>
                    {q.options?.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={q.answers.includes(opt)}
                          onChange={() => toggleAnswerCheckbox(qIndex, opt)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <input
                          type="text"
                          className="flex-1 border rounded-lg p-2 bg-white text-sm"
                          value={opt}
                          onChange={(e) => handleOptionChange(qIndex, oIdx, e.target.value)}
                          required
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addOption(qIndex)}
                      className="text-sm text-blue-600 font-semibold hover:underline pt-1 block"
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
            className="px-5 py-2.5 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50"
          >
            + Add Question
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Save Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
}
