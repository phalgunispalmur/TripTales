// layout/AuthProvider.tsx
import { auth } from "@/firebase/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  User as FirebaseUser,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

type User = {
  uid: string;
  name?: string | null;
  email?: string | null;
};

type AuthContextType = {
  user: User | null;
  initializing: boolean;
  /**
   * login can be called either:
   *  - login(name: string) => signs in anonymously and sets displayName (keeps backward compatibility)
   *  - login(email: string, password: string) => email/password sign-in
   */
  login: (...args: [string] | [string, string]) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        setUser({
          uid: fbUser.uid,
          name: fbUser.displayName ?? null,
          email: fbUser.email ?? null,
        });
      } else {
        setUser(null);
      }
      setInitializing(false);
    });
    return () => unsub();
  }, []);

  // Overloaded login for backwards compatibility
  const login = async (...args: [string] | [string, string]) => {
    if (args.length === 1) {
      // Legacy: login(name) -> sign in anonymously and set displayName
      const [displayName] = args;
      const cred = await signInAnonymously(auth);
      if (displayName) {
        try {
          await updateProfile(cred.user, { displayName });
        } catch (err) {
          console.warn("Could not set displayName for anonymous user", err);
        }
      }
      // onAuthStateChanged will update state
      return;
    } else {
      // login(email, password)
      const [email, password] = args as [string, string];
      await signInWithEmailAndPassword(auth, email, password);
      return;
    }
  };

  const register = async (email: string, password: string, displayName?: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
      // Manually update state with the new displayName
      setUser({
        uid: cred.user.uid,
        name: displayName,
        email: cred.user.email,
      });
    }
    // onAuthStateChanged will also update state, but we've already set it above
  };

  const logout = async () => {
    try {
      console.log("AuthProvider: Starting logout...");
      await signOut(auth);
      console.log("AuthProvider: Firebase signOut completed");
      setUser(null);
      console.log("AuthProvider: User state cleared");
    } catch (error) {
      console.error("AuthProvider: Logout error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, initializing, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an AuthProvider");
  return context;
}
export const useAuthContext = useAuth;
