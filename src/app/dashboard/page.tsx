import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container max-w-5xl py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            Ultimate Todo
          </Link>
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              ホームに戻る
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-1 container max-w-5xl py-8">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-6">タスク管理アプリ</h1>
          <p className="text-lg text-muted-foreground mb-8">
            このアプリは現在開発中です。機能はこれから実装されます。
          </p>
          <div className="bg-card p-6 rounded-lg border shadow-sm max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4">サンプルタスク</h2>
            <ul className="space-y-2 text-left">
              <li className="p-3 bg-muted rounded-md">プロジェクト計画を作成する</li>
              <li className="p-3 bg-muted rounded-md">買い物リストを作る</li>
              <li className="p-3 bg-muted rounded-md">週末の予定を立てる</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
