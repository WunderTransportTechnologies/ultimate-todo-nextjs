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
} from 'firebase/firestore';
import { db } from '../config';
import { Category } from '@/types/todo';

// DBから取得したデータをCategoryオブジェクトに変換する
const dbObjectToCategory = (id: string, data: any): Category => {
  return {
    id,
    name: data.name,
    color: data.color,
    userId: data.userId,
  };
};

// ユーザーのカテゴリ一覧を取得
export const getUserCategories = async (userId: string): Promise<Category[]> => {
  const categoriesRef = collection(db, 'categories');
  const q = query(
    categoriesRef,
    where('userId', '==', userId),
    orderBy('name', 'asc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => dbObjectToCategory(doc.id, doc.data()));
};

// カテゴリを作成
export const createCategory = async (
  category: Omit<Category, 'id'>
): Promise<Category> => {
  const categoriesRef = collection(db, 'categories');
  const docRef = await addDoc(categoriesRef, {
    ...category,
    createdAt: serverTimestamp(),
  });
  
  const newCategory = await getDoc(docRef);
  return dbObjectToCategory(docRef.id, newCategory.data());
};

// カテゴリを更新
export const updateCategory = async (
  id: string,
  category: Partial<Omit<Category, 'id' | 'userId'>>
): Promise<void> => {
  const categoryRef = doc(db, 'categories', id);
  await updateDoc(categoryRef, {
    ...category,
    updatedAt: serverTimestamp(),
  });
};

// カテゴリを削除
export const deleteCategory = async (id: string): Promise<void> => {
  const categoryRef = doc(db, 'categories', id);
  await deleteDoc(categoryRef);
};

// デフォルトカテゴリを作成（ユーザー登録時に使用）
export const createDefaultCategories = async (userId: string): Promise<void> => {
  const defaultCategories = [
    {
      name: '仕事',
      color: '#4f46e5', // インディゴ
      userId,
    },
    {
      name: '個人',
      color: '#10b981', // エメラルド
      userId,
    },
    {
      name: '買い物',
      color: '#f59e0b', // アンバー
      userId,
    },
    {
      name: '健康',
      color: '#ef4444', // レッド
      userId,
    },
  ];

  // 一括で作成
  const categoriesRef = collection(db, 'categories');
  const promises = defaultCategories.map((category) => 
    addDoc(categoriesRef, {
      ...category,
      createdAt: serverTimestamp(),
    })
  );

  await Promise.all(promises);
};
