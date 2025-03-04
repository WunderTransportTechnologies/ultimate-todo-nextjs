import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config';
import { Todo, TodoStatus, PriorityLevel } from '@/types/todo';

// Todoをデータベース用のオブジェクトに変換する
const todoToDbObject = (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
  const dbObject: any = {
    ...todo,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // Dateオブジェクトをタイムスタンプに変換
  if (todo.dueDate) {
    dbObject.dueDate = Timestamp.fromDate(todo.dueDate);
  }

  return dbObject;
};

// DBから取得したデータをTodoオブジェクトに変換する
const dbObjectToTodo = (id: string, data: any): Todo => {
  // タイムスタンプをDateオブジェクトに変換
  const createdAt = data.createdAt ? data.createdAt.toDate() : new Date();
  const updatedAt = data.updatedAt ? data.updatedAt.toDate() : new Date();
  const dueDate = data.dueDate ? data.dueDate.toDate() : undefined;

  return {
    id,
    title: data.title,
    description: data.description,
    status: data.status as TodoStatus,
    priority: data.priority as PriorityLevel,
    dueDate,
    createdAt,
    updatedAt,
    userId: data.userId,
    categoryId: data.categoryId,
  };
};

// ユーザーのタスク一覧を取得
export const getUserTodos = async (userId: string): Promise<Todo[]> => {
  const todosRef = collection(db, 'todos');
  const q = query(
    todosRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => dbObjectToTodo(doc.id, doc.data()));
};

// タスクを作成
export const createTodo = async (
  todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Todo> => {
  const todosRef = collection(db, 'todos');
  const dbObject = todoToDbObject(todo);
  
  const docRef = await addDoc(todosRef, dbObject);
  const newTodo = await getDoc(docRef);
  
  return dbObjectToTodo(docRef.id, newTodo.data());
};

// タスクを更新
export const updateTodo = async (
  id: string,
  todo: Partial<Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  const todoRef = doc(db, 'todos', id);
  
  const updateData: any = {
    ...todo,
    updatedAt: serverTimestamp(),
  };
  
  // Dateオブジェクトをタイムスタンプに変換
  if (todo.dueDate) {
    updateData.dueDate = Timestamp.fromDate(todo.dueDate);
  }
  
  await updateDoc(todoRef, updateData);
};

// タスクを削除
export const deleteTodo = async (id: string): Promise<void> => {
  const todoRef = doc(db, 'todos', id);
  await deleteDoc(todoRef);
};

// タスクのステータスを更新
export const updateTodoStatus = async (
  id: string,
  status: TodoStatus
): Promise<void> => {
  await updateTodo(id, { status });
};

// タスクを完了状態に設定
export const completeTodo = async (id: string): Promise<void> => {
  await updateTodoStatus(id, 'completed');
};

// タスクの優先度を更新
export const updateTodoPriority = async (
  id: string,
  priority: PriorityLevel
): Promise<void> => {
  await updateTodo(id, { priority });
};

// カテゴリでタスクをフィルタリング
export const getTodosByCategory = async (
  userId: string,
  categoryId: string
): Promise<Todo[]> => {
  const todosRef = collection(db, 'todos');
  const q = query(
    todosRef,
    where('userId', '==', userId),
    where('categoryId', '==', categoryId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => dbObjectToTodo(doc.id, doc.data()));
};

// ステータスでタスクをフィルタリング
export const getTodosByStatus = async (
  userId: string,
  status: TodoStatus
): Promise<Todo[]> => {
  const todosRef = collection(db, 'todos');
  const q = query(
    todosRef,
    where('userId', '==', userId),
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => dbObjectToTodo(doc.id, doc.data()));
};
