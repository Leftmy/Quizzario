import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-4xl font-bold mb-6">Quiz Builder Platform</h1>
      <div className="flex gap-4">
        <Link
          href="/quizzes"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
        >
          View All Quizzes
        </Link>
        <Link
          href="/create"
          className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 font-semibold"
        >
          Create New Quiz
        </Link>
      </div>
    </main>
  );
}