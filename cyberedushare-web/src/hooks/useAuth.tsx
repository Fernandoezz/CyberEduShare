import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { saveAuth, clearAuth, getUser, getToken } from '../utils/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]   = useState<User | null>(getUser());
  const [token, setToken] = useState<string | null>(getToken());

  const login = (token: string, user: User) => {
    saveAuth(token, user);
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    clearAuth();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
