"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/components/providers/auth-provider";
import { Todo, PriorityLevel, TodoStatus } from "@/types/todo";
import { createTodo } from "@/lib/firebase/firestore/todo-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const todoSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.string().optional(),
});

type TodoFormValues = z.infer<typeof todoSchema>;

interface TodoFormProps {
  onSuccess: (todo: Todo) => void;
  onCancel: () => void;
}

export function TodoForm({ onSuccess, onCancel }: TodoFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TodoFormValues>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
    },
  });

  const onSubmit = async (data: TodoFormValues) => {
    if (!user) {
      toast.error("ログインが必要です");
      return;
    }

    setIsLoading(true);
    try {
      const todoData = {
        title: data.title,
        description: data.description,
        priority: data.priority as PriorityLevel,
        status: "pending" as TodoStatus,
        userId: user.uid,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      };

      const newTodo = await createTodo(todoData);
      onSuccess(newTodo);
      reset();
    } catch (error) {
      console.error("タスク作成エラー:", error);
      toast.error("タスクの作成に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">タイトル</Label>
        <Input
          id="title"
          placeholder="タスクのタイトル"
          disabled={isLoading}
          {...register("title")}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">説明（任意）</Label>
        <Textarea
          id="description"
          placeholder="タスクの詳細"
          disabled={isLoading}
          {...register("description")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">優先度</Label>
          <Select
            disabled={isLoading}
            defaultValue="medium"
            onValueChange={(value) => register("priority").onChange({ target: { value } })}
          >
            <SelectTrigger id="priority">
              <SelectValue placeholder="優先度を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">低</SelectItem>
              <SelectItem value="medium">中</SelectItem>
              <SelectItem value="high">高</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">期限日（任意）</Label>
          <Input
            id="dueDate"
            type="date"
            disabled={isLoading}
            {...register("dueDate")}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          キャンセル
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "作成中..." : "タスクを作成"}
        </Button>
      </div>
    </form>
  );
}
