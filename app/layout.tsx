import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI学习路径规划器',
  description: '通过AI生成个性化的物理学习路径',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-gradient-to-b from-blue-50 to-white" suppressHydrationWarning>
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              AI学习路径规划器
            </h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
