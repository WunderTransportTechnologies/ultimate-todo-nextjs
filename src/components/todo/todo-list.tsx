"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { getUserTodos } from "@/lib/firebase/firestore/todo-service";
import { getUserCategories } from "@/lib/firebase/firestore/category-service";
import { Todo, Category } from "@/types/todo";
import { TodoCard } from "./todo-card";
import { TodoFilter } from "./todo-filter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export function TodoList() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState({
    status: "all",
    priority: "all",
    category: "all",
    search: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          setLoading(true);
          const [fetchedTodos, fetchedCategories] = await Promise.all([
            getUserTodos(user.uid),
            getUserCategories(user.uid),
          ]);
          setTodos(fetchedTodos);
          setCategories(fetchedCategories);
        } catch (error) {
          console.error("データの取得に失敗しました:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    if (todos.length > 0) {
      let filtered = [...todos];

      // ステータスフィルタリング
      if (filter.status !== "all") {
        filtered = filtered.filter((todo) => todo.status === filter.status);
      }

      // 優先度フィルタリング
      if (filter.priority !== "all") {
        filtered = filtered.filter((todo) => todo.priority === filter.priority);
      }

      // カテゴリフィルタリング
      if (filter.category !== "all") {
        filtered = filtered.filter((todo) => todo.categoryId === filter.category);
      }

      // 検索フィルタリング
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        filtered = filtered.filter(
          (todo) =>
            todo.title.toLowerCase().includes(searchLower) ||
            (todo.description && todo.description.toLowerCase().includes(searchLower))
        );
      }

      setFilteredTodos(filtered);
    } else {
      setFilteredTodos([]);
    }
  }, [todos, filter]);

  const handleFilterChange = (newFilter: Partial<typeof filter>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }));
  };

  const pendingTodos = filteredTodos.filter((todo) => todo.status === "pending");
  const inProgressTodos = filteredTodos.filter((todo) => todo.status === "in-progress");
  const completedTodos = filteredTodos.filter((todo) => todo.status === "completed");

  if (!user) {
    return (
      <div className="text-center py-12">
        <p>ログインしてタスクを管理しましょう</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TodoFilter
        filter={filter}
        onFilterChange={handleFilterChange}
        categories={categories}
      />

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-md" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              すべて <span className="ml-1">({filteredTodos.length})</span>
            </TabsTrigger>
            <TabsTrigger value="pending">
              未着手 <span className="ml-1">({pendingTodos.length})</span>
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              進行中 <span className="ml-1">({inProgressTodos.length})</span>
            </TabsTrigger>
            <TabsTrigger value="completed">
              完了 <span className="ml-1">({completedTodos.length})</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            {filteredTodos.length > 0 ? (
              <div className="space-y-4">
                {filteredTodos.map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    categories={categories}
                    onUpdate={(updatedTodo) => {
                      setTodos((prevTodos) =>
                        prevTodos.map((t) =>
                          t.id === updatedTodo.id ? updatedTodo : t
                        )
                      );
                    }}
                    onDelete={(id) => {
                      setTodos((prevTodos) => prevTodos.filter((t) => t.id !== id));
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">表示するタスクがありません</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="pending" className="mt-6">
            {pendingTodos.length > 0 ? (
              <div className="space-y-4">
                {pendingTodos.map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    categories={categories}
                    onUpdate={(updatedTodo) => {
                      setTodos((prevTodos) =>
                        prevTodos.map((t) =>
                          t.id === updatedTodo.id ? updatedTodo : t
                        )
                      );
                    }}
                    onDelete={(id) => {
                      setTodos((prevTodos) => prevTodos.filter((t) => t.id !== id));
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">未着手のタスクがありません</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="in-progress" className="mt-6">
            {inProgressTodos.length > 0 ? (
              <div className="space-y-4">
                {inProgressTodos.map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    categories={categories}
                    onUpdate={(updatedTodo) => {
                      setTodos((prevTodos) =>
                        prevTodos.map((t) =>
                          t.id === updatedTodo.id ? updatedTodo : t
                        )
                      );
                    }}
                    onDelete={(id) => {
                      setTodos((prevTodos) => prevTodos.filter((t) => t.id !== id));
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">進行中のタスクがありません</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="completed" className="mt-6">
            {completedTodos.length > 0 ? (
              <div className="space-y-4">
                {completedTodos.map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    categories={categories}
                    onUpdate={(updatedTodo) => {
                      setTodos((prevTodos) =>
                        prevTodos.map((t) =>
                          t.id === updatedTodo.id ? updatedTodo : t
                        )
                      );
                    }}
                    onDelete={(id) => {
                      setTodos((prevTodos) => prevTodos.filter((t) => t.id !== id));
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">完了したタスクがありません</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
