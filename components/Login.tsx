"use client";

import { useState } from "react";
import { useAuth } from "./AuthContext";
import { User, Key, LogIn, UserPlus } from "lucide-react";

export default function Login() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  const [username, setUsername] = useState("");
  const [role, setRole] = useState<"cliente" | "organizador">("cliente");

  const handleAuth = () => {
    if (!username.trim()) return;
    if (isRegister) {
      register(username, role);
    } else {
      login(username, role);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen" style={{ background: "#0a0f1e" }}>
      <div className="w-80 rounded-2xl border border-[rgba(255,255,255,0.15)] bg-[rgba(15,23,42,0.5)] p-6 shadow-[0_25px_45px_rgba(0,0,0,0.35)] backdrop-blur-xl">

        <h1 className="text-2xl font-bold text-center mb-1 text-white">EventFi</h1>
        <p className="text-center text-xs text-cyan-300 mb-6">Impulsado por Solana</p>

        <div className="flex gap-2 mb-6 bg-[rgba(255,255,255,0.08)] rounded-lg p-1">
          <button
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-semibold transition ${
              !isRegister
                ? "bg-[rgba(124,58,237,0.4)] text-white"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <LogIn className="h-3 w-3 inline mr-1" />
            Entrar
          </button>
          <button
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-semibold transition ${
              isRegister
                ? "bg-[rgba(124,58,237,0.4)] text-white"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <UserPlus className="h-3 w-3 inline mr-1" />
            Registrarse
          </button>
        </div>

        <div className="mb-3 flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.06)] px-3 py-2">
          <User className="h-4 w-4 text-[#7c3aed]" />
          <input
            placeholder={isRegister ? "Elige un usuario" : "Usuario"}
            className="w-full bg-transparent outline-none text-sm text-white placeholder:text-slate-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="mb-4 flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.06)] px-3 py-2">
          <Key className="h-4 w-4 text-[#06b6d4]" />
          <div className="relative w-full">
            <select
              className="w-full bg-transparent pl-0 pr-8 py-2 text-sm text-white outline-none appearance-none"
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
            >
              <option value="cliente" className="bg-slate-900 text-white">Cliente</option>
              <option value="organizador" className="bg-slate-900 text-white">Organizador</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-[#7c3aed]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <button
          onClick={handleAuth}
          className="w-full rounded-xl border border-[rgba(124,58,237,0.6)] bg-[rgba(124,58,237,0.25)] px-4 py-2 font-semibold text-white transition hover:bg-[rgba(124,58,237,0.45)] flex items-center justify-center gap-2"
        >
          {isRegister ? (
            <>
              <UserPlus className="h-4 w-4" />
              Registrarse
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Entrar
            </>
          )}
        </button>

      </div>
    </div>
  );
}