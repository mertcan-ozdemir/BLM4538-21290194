import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../firebase/config';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';

type User = {
  id: string;
  username: string;
  email: string | null;
};

type AuthContextData = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

type AuthProviderProps = {
  children: ReactNode;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Kullanıcı oturum açmış
        const userData: User = {
          id: firebaseUser.uid,
          username: firebaseUser.displayName || 'User',
          email: firebaseUser.email,
        };
        
        await AsyncStorage.setItem('@MovieApp:user', JSON.stringify(userData));
        setUser(userData);
      } else {
        // Kullanıcı oturum açmamış
        await AsyncStorage.removeItem('@MovieApp:user');
        setUser(null);
      }
      setIsLoading(false);
    });

    // Cleanup fonksiyonu (component unmount olduğunda çalışır)
    return () => unsubscribe();
  }, []);

  async function signIn(email: string, password: string): Promise<void> {
    try {
      setIsLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Kullanıcı verilerini oluştur
      const userData: User = {
        id: userCredential.user.uid,
        username: userCredential.user.displayName || 'User',
        email: userCredential.user.email,
      };
      
      // Storage'a kullanıcı bilgilerini kaydet
      await AsyncStorage.setItem('@MovieApp:user', JSON.stringify(userData));
      
      // State'i güncelle
      setUser(userData);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function signUp(username: string, email: string, password: string): Promise<void> {
    try {
      setIsLoading(true);
      // Firebase ile kullanıcı oluştur
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Kullanıcı verilerini oluştur
      const userData: User = {
        id: userCredential.user.uid,
        username,
        email: userCredential.user.email,
      };
      
      // Storage'a kullanıcı bilgilerini kaydet
      await AsyncStorage.setItem('@MovieApp:user', JSON.stringify(userData));
      
      // State'i güncelle
      setUser(userData);
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function signOut(): Promise<void> {
    try {
      setIsLoading(true);
      // Firebase oturumunu kapat
      await firebaseSignOut(auth);
      
      // Storage'dan kullanıcı bilgilerini sil
      await AsyncStorage.removeItem('@MovieApp:user');
      
      // State'i güncelle
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
} 