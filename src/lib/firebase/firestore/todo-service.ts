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
  const createdAt = data.createdAt instanceof Timestamp 
    ? data.createdAt.toDate() 
    : new Date();
  const updatedAt = data.updatedAt instanceof Timestamp 
    ? data.updatedAt.toDate() 
    : new Date();
  const dueDate = data.dueDate instanceof Timestamp 
    ? data.dueDate.toDate() 
    : undefined;

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

// Todoコレクションの参照を取得
const todosRef = collection(db, 'todos');

// 新しいTodoを作成
export const createTodo = async (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
  const dbObject = todoToDbObject(todo);
  const docRef = await addDoc(todosRef, dbObject);
  return docRef.id;
};

// Todoを更新
export const updateTodo = async (id: string, todo: Partial<Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>>) => {
  const docRef = doc(db, 'todos', id);
  const updateData = { ...todo, updatedAt: serverTimestamp() };

  // Dateオブジェクトをタイムスタンプに変換
  if (todo.dueDate) {
    updateData.dueDate = Timestamp.fromDate(todo.dueDate);
  }

  await updateDoc(docRef, updateData);
};

// Todoを削除
export const deleteTodo = async (id: string) => {
  const docRef = doc(db, 'todos', id);
  await deleteDoc(docRef);
};

// ユーザーのすべてのTodoを取得
export const getUserTodos = async (userId: string): Promise<Todo[]> => {
  const q = query(
    todosRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const todos: Todo[] = [];

  querySnapshot.forEach((doc) => {
    todos.push(dbObjectToTodo(doc.id, doc.data()));
  });

  return todos;
};

// IDによって特定のTodoを取得
export const getTodoById = async (id: string): Promise<Todo | null> => {
  const docRef = doc(db, 'todos', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return dbObjectToTodo(docSnap.id, docSnap.data());
  }

  return null;
};

// Todoのステータスを更新
export const updateTodoStatus = async (id: string, status: TodoStatus) => {
  await updateTodo(id, { status });
};

// Todoの優先度を更新
export const updateTodoPriority = async (id: string, priority: PriorityLevel) => {
  await updateTodo(id, { priority });
};

// ステータスでフィルタリングしたTodoを取得
export const getTodosByStatus = async (userId: string, status: TodoStatus): Promise<Todo[]> => {
  const q = query(
    todosRef,
    where('userId', '==', userId),
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const todos: Todo[] = [];

  querySnapshot.forEach((doc) => {
    todos.push(dbObjectToTodo(doc.id, doc.data()));
  });

  return todos;
};

// 優先度でフィルタリングしたTodoを取得
export const getTodosByPriority = async (userId: string, priority: PriorityLevel): Promise<Todo[]> => {
  const q = query(
    todosRef,
    where('userId', '==', userId),
    where('priority', '==', priority),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const todos: Todo[] = [];

  querySnapshot.forEach((doc) => {
    todos.push(dbObjectToTodo(doc.id, doc.data()));
  });

  return todos;
};

// カテゴリでフィルタリングしたTodoを取得
export const getTodosByCategory = async (userId: string, categoryId: string): Promise<Todo[]> => {
  const q = query(
    todosRef,
    where('userId', '==', userId),
    where('categoryId', '==', categoryId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const todos: Todo[] = [];

  querySnapshot.forEach((doc) => {
    todos.push(dbObjectToTodo(doc.id, doc.data()));
  });

  return todos;
};
