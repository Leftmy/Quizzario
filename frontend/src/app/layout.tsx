import './globals.css';

export const metadata = {
  title: 'Quizzario',
  description: 'Create and manage custom quizzes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-900 min-h-screen text-slate-100">{children}</body>
    </html>
  );
}
