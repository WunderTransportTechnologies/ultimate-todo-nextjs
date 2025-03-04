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

// カテゴリをデータベース用のオブジェクトに変換する
const categoryToDbObject = (category: Omit<Category, 'id'>) => {
  return {
    ...category,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
};

// DBから取得したデータをカテゴリオブジェクトに変換する
const dbObjectToCategory = (id: string, data: any): Category => {
  return {
    id,
    name: data.name,
    color: data.color,
    userId: data.userId,
  };
};

// カテゴリコレクションの参照を取得
const categoriesRef = collection(db, 'categories');

// 新しいカテゴリを作成
export const createCategory = async (category: Omit<Category, 'id'>) => {
  const dbObject = categoryToDbObject(category);
  const docRef = await addDoc(categoriesRef, dbObject);
  return docRef.id;
};

// カテゴリを更新
export const updateCategory = async (id: string, category: Partial<Omit<Category, 'id'>>) => {
  const docRef = doc(db, 'categories', id);
  const updateData = { ...category, updatedAt: serverTimestamp() };
  await updateDoc(docRef, updateData);
};

// カテゴリを削除
export const deleteCategory = async (id: string) => {
  const docRef = doc(db, 'categories', id);
  await deleteDoc(docRef);
};

// ユーザーのすべてのカテゴリを取得
export const getUserCategories = async (userId: string): Promise<Category[]> => {
  const q = query(
    categoriesRef,
    where('userId', '==', userId),
    orderBy('name', 'asc')
  );

  const querySnapshot = await getDocs(q);
  const categories: Category[] = [];

  querySnapshot.forEach((doc) => {
    categories.push(dbObjectToCategory(doc.id, doc.data()));
  });

  return categories;
};

// IDによって特定のカテゴリを取得
export const getCategoryById = async (id: string): Promise<Category | null> => {
  const docRef = doc(db, 'categories', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return dbObjectToCategory(docSnap.id, docSnap.data());
  }

  return null;
};

// デフォルトカテゴリを初期化
export const initializeDefaultCategories = async (userId: string): Promise<void> => {
  const defaultCategories = [
    { name: '仕事', color: '#4338ca', userId },
    { name: 'プライベート', color: '#16a34a', userId },
    { name: '勉強', color: '#ea580c', userId },
    { name: '買い物', color: '#db2777', userId },
  ];

  const q = query(categoriesRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);

  // ユーザーのカテゴリが存在しない場合のみ初期化
  if (querySnapshot.empty) {
    for (const category of defaultCategories) {
      await createCategory(category);
    }
  }
};
