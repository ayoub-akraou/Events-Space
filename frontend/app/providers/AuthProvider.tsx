"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getApiBase } from "../../lib/api";

export type AuthUser = {
  userId: string;
  email: string;
  role: "ADMIN" | "PARTICIPANT";
  fullName?: string | null;
};

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; message: string }>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "events-space-token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const apiBase = getApiBase();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = useCallback(async (jwt: string) => {
    const res = await fetch(`${apiBase}/auth/me`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    if (!res.ok) {
      throw new Error("Unauthorized");
    }
    const data = (await res.json()) as AuthUser;
    setUser(data);
  }, [apiBase]);

  const refresh = useCallback(async () => {
    const jwt = window.localStorage.getItem(TOKEN_KEY);
    if (!jwt) {
      setToken(null);
      setUser(null);
      return;
    }
    setToken(jwt);
    try {
      await fetchMe(jwt);
    } catch {
      window.localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    }
  }, [fetchMe]);

  useEffect(() => {
    (async () => {
      try {
        await refresh();
      } finally {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login: AuthContextValue["login"] = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        return { ok: false, message: "Identifiants invalides." };
      }
      const data = (await res.json()) as { access_token: string };
      window.localStorage.setItem(TOKEN_KEY, data.access_token);
      setToken(data.access_token);
      await fetchMe(data.access_token);
      return { ok: true };
    } catch {
      return { ok: false, message: "Connexion impossible. Reessaie." };
    } finally {
      setIsLoading(false);
    }
  }, [apiBase, fetchMe]);

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ token, user, isLoading, login, logout, refresh }),
    [token, user, isLoading, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
