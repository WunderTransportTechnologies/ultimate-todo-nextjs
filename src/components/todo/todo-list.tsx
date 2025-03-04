"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Todo, TodoStatus } from "@/types/todo";
import { getUserTodos, updateTodoStatus, deleteTodo } from "@/lib/firebase/firestore/todo-service";
import { TodoItem } from "./todo-item";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircleIcon } from "@/components/icons";
import { toast } from "sonner";
import { TodoForm } from "./todo-form";

export function TodoList() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TodoStatus | "all">("all");
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    const fetchTodos = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const userTodos = await getUserTodos(user.uid);
        setTodos(userTodos);
      } catch (error) {
        console.error("タスク取得エラー:", error);
        toast.error("タスクの取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodos();
  }, [user]);

  const handleStatusChange = async (id: string, status: TodoStatus) => {
    try {
      await updateTodoStatus(id, status);
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id ? { ...todo, status, updatedAt: new Date() } : todo
        )
      );
      toast.success("タスクのステータスを更新しました");
    } catch (error) {
      console.error("ステータス更新エラー:", error);
      toast.error("ステータスの更新に失敗しました");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTodo(id);
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
      toast.success("タスクを削除しました");
    } catch (error) {
      console.error("タスク削除エラー:", error);
      toast.error("タスクの削除に失敗しました");
    }
  };

  const handleTodoCreated = (newTodo: Todo) => {
    setTodos((prevTodos) => [newTodo, ...prevTodos]);
    setShowCreateForm(false);
    toast.success("タスクを作成しました");
  };

  const filteredTodos = todos.filter((todo) => {
    if (activeTab === "all") return true;
    return todo.status === activeTab;
  });

  if (isLoading) {
    return <div className="text-center py-10">読み込み中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">タスク一覧</h1>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <PlusCircleIcon className="w-4 h-4 mr-2" />
          新規タスク
        </Button>
      </div>

      {showCreateForm && (
        <div className="bg-card p-4 rounded-lg border mb-4">
          <TodoForm onSuccess={handleTodoCreated} onCancel={() => setShowCreateForm(false)} />
        </div>
      )}

      <Tabs defaultValue="all" onValueChange={(value) => setActiveTab(value as TodoStatus | "all")}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">全て</TabsTrigger>
          <TabsTrigger value="pending">未着手</TabsTrigger>
          <TabsTrigger value="in-progress">進行中</TabsTrigger>
          <TabsTrigger value="completed">完了</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredTodos.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              {activeTab === "all"
                ? "タスクがありません。新しいタスクを作成しましょう！"
                : `${activeTab === "pending" ? "未着手" : activeTab === "in-progress" ? "進行中" : "完了"}のタスクはありません`}
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
