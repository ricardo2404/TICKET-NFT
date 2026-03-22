"use client";

import { createContext, useContext, useState } from "react";

type User = {
  username: string;
  role: "cliente" | "organizador" | "admin";
};

const AuthContext = createContext<any>(null);

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: any) {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, role: User["role"]) => {
    setUser({ username, role });
  };

  const register = (username: string, role: User["role"]) => {
    // En producción, aquí irían validaciones y llamadas a un servidor
    setUser({ username, role });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}