"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { LogOutIcon, MoonIcon, SunIcon, UserIcon } from "@/components/icons";
import { toast } from "sonner";

export function TodoHeader() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("ログアウトしました");
    } catch (error) {
      console.error("ログアウトエラー:", error);
      toast.error("ログアウトに失敗しました");
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="border-b">
      <div className="container max-w-5xl py-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-xl font-bold">
          Ultimate Todo
        </Link>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="テーマ切り替え"
          >
            {theme === "dark" ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </Button>
          <div className="flex items-center gap-2">
            {user && (
              <>
                <span className="text-sm hidden md:inline-block">
                  <UserIcon className="inline-block w-4 h-4 mr-1" />
                  {user.email}
                </span>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOutIcon className="h-4 w-4 mr-2" />
                  ログアウト
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
