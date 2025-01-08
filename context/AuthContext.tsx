"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // ✅ Explicitly state that 'user' can be a Supabase 'User' OR null
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1) Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    getSession();

    // 2) Listen for auth changes
    const authListener = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    // 3) Cleanup (unsubscribe) on unmount
    return () => {
      authListener.data.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
