import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  User,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config';
import { createDefaultCategories } from '../firestore/category-service';

// ユーザー登録
export const signUp = async (email: string, password: string, displayName?: string): Promise<User> => {
  try {
    // Firebaseで認証ユーザーを作成
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    // 表示名を設定（任意）
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    // Firestoreにユーザー情報を保存
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      displayName: displayName || user.email?.split('@')[0],
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });

    // デフォルトカテゴリを作成
    await createDefaultCategories(user.uid);

    return user;
  } catch (error) {
    console.error('ユーザー登録エラー:', error);
    throw error;
  }
};

// ログイン
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);

    // ログイン時間を更新
    await setDoc(
      doc(db, 'users', user.uid),
      {
        lastLogin: serverTimestamp(),
      },
      { merge: true }
    );

    return user;
  } catch (error) {
    console.error('ログインエラー:', error);
    throw error;
  }
};

// ログアウト
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('ログアウトエラー:', error);
    throw error;
  }
};

// パスワードリセットメールの送信
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('パスワードリセットエラー:', error);
    throw error;
  }
};
