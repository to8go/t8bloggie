import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  deleteUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthContextType {
  user: FirebaseUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Create or update user document when user signs in
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          await setDoc(userRef, {
            email: user.email,
            uid: user.uid,
            isAdmin: true, // Since this is an admin-only app
            displayName: user.displayName || user.email?.split('@')[0],
            photoURL: user.photoURL || '',
            badges: ['admin'],
            createdAt: new Date().toISOString()
          });
        }
      }
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Create or update user document
      const userRef = doc(db, 'users', result.user.uid);
      await setDoc(userRef, {
        email: result.user.email,
        uid: result.user.uid,
        isAdmin: true,
        displayName: result.user.displayName || result.user.email?.split('@')[0],
        photoURL: result.user.photoURL || '',
        badges: ['admin'],
        createdAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const deleteAccount = async () => {
    if (!user) return;

    try {
      // Delete all posts by the user
      const postsQuery = query(collection(db, 'posts'), where('authorId', '==', user.uid));
      const postsSnapshot = await getDocs(postsQuery);
      
      const deletions = postsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletions);

      // Delete user document
      await deleteDoc(doc(db, 'users', user.uid));

      // Delete user account
      await deleteUser(user);
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, deleteAccount, loading, error }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}