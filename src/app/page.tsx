import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-3xl text-center space-y-8">
        <h1 className="text-4xl font-bold sm:text-6xl">Ultimate Todo App</h1>
        <p className="text-xl text-muted-foreground">
          シンプルでパワフルなタスク管理アプリケーション
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/dashboard">
              デモを開始
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
