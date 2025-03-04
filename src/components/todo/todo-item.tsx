"use client";

import { useState } from "react";
import { Todo, TodoStatus } from "@/types/todo";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  MoreVerticalIcon, 
  TrashIcon, 
  EditIcon 
} from "@/components/icons";

interface TodoItemProps {
  todo: Todo;
  onStatusChange: (id: string, status: TodoStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TodoItem({ todo, onStatusChange, onDelete }: TodoItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleStatusChange = async (status: TodoStatus) => {
    if (status === todo.status) return;
    
    setIsUpdating(true);
    try {
      await onStatusChange(todo.id, status);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("このタスクを削除してもよろしいですか？")) {
      setIsUpdating(true);
      try {
        await onDelete(todo.id);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  // ステータスに応じたバッジの色を設定
  const statusBadge = () => {
    switch (todo.status) {
      case "pending":
        return <Badge variant="outline">未着手</Badge>;
      case "in-progress":
        return <Badge variant="secondary">進行中</Badge>;
      case "completed":
        return <Badge variant="default">完了</Badge>;
      default:
        return null;
    }
  };

  // 優先度に応じたバッジの色を設定
  const priorityBadge = () => {
    switch (todo.priority) {
      case "low":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 hover:bg-blue-50">低</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 hover:bg-yellow-50">中</Badge>;
      case "high":
        return <Badge variant="outline" className="bg-red-50 text-red-600 hover:bg-red-50">高</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className={isUpdating ? "opacity-70" : ""}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{todo.title}</CardTitle>
            <CardDescription className="mt-1">{formatDate(todo.createdAt)}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>タスク操作</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleStatusChange("pending")} disabled={todo.status === "pending"}>
                未着手に設定
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("in-progress")} disabled={todo.status === "in-progress"}>
                進行中に設定
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("completed")} disabled={todo.status === "completed"}>
                完了に設定
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {todo.description && <p className="text-sm mb-2">{todo.description}</p>}
        <div className="flex items-center gap-2 mt-2">
          {statusBadge()}
          {priorityBadge()}
          {todo.dueDate && (
            <div className="flex items-center text-xs text-muted-foreground">
              <CalendarIcon className="h-3 w-3 mr-1" />
              {formatDate(todo.dueDate)}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between">
        <div className="flex items-center text-xs text-muted-foreground">
          <ClockIcon className="h-3 w-3 mr-1" />
          更新: {formatDate(todo.updatedAt)}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => handleStatusChange("completed")}
            disabled={todo.status === "completed" || isUpdating}
          >
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            完了
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
