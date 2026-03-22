"use client";

import { useAuth } from "./AuthContext";
import { Home, Ticket, Users, Settings, LogOut } from "lucide-react";

export default function Navbar({ setView }: any) {
  const { user, logout } = useAuth();

  return (
    <div className="border-b border-[rgba(255,255,255,0.1)] bg-[rgba(10,15,30,0.7)] text-white p-4 flex justify-between items-center backdrop-blur-md" style={{ background: "rgba(10, 15, 30, 0.7)" }}>
      <h1 className="text-lg font-bold tracking-tight text-white">EventFi</h1>

      <div className="flex gap-2">
        <button
          onClick={() => setView("home")}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-transparent hover:border-purple-500 hover:bg-[rgba(124,58,237,0.2)] transition-all text-sm text-slate-200 hover:text-white font-medium"
        >
          <Home className="h-4 w-4 text-[#7c3aed]" />
          Eventos
        </button>

        {user?.role === "cliente" && (
          <button
            onClick={() => setView("profile")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-transparent hover:border-cyan-400 hover:bg-[rgba(6,182,212,0.2)] transition-all text-sm text-slate-200 hover:text-white font-medium"
          >
            <Ticket className="h-4 w-4 text-[#06b6d4]" />
            Mis Tickets
          </button>
        )}

        {user?.role === "organizador" && (
          <button
            onClick={() => setView("organizer")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-transparent hover:border-purple-500 hover:bg-[rgba(124,58,237,0.2)] transition-all text-sm text-slate-200 hover:text-white font-medium"
          >
            <Users className="h-4 w-4 text-[#7c3aed]" />
            Organizador
          </button>
        )}

        {user?.role === "admin" && (
          <button
            onClick={() => setView("admin")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-transparent hover:border-cyan-400 hover:bg-[rgba(6,182,212,0.2)] transition-all text-sm text-slate-200 hover:text-white font-medium"
          >
            <Settings className="h-4 w-4 text-[#06b6d4]" />
            Admin
          </button>
        )}
      </div>

      <button
        onClick={logout}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[rgba(255,255,255,0.2)] bg-[rgba(124,58,237,0.15)] hover:bg-[rgba(124,58,237,0.3)] transition-all text-sm text-slate-200 hover:text-white font-medium"
      >
        <LogOut className="h-4 w-4" />
        Salir
      </button>
    </div>
  );
}