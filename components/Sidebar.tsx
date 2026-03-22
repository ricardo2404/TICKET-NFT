"use client";

import { useAuth } from "./AuthContext";
import { Home, Ticket, User, Users, Settings, LogOut } from "lucide-react";

export default function Sidebar({ setView }: any) {
  const { user, logout } = useAuth();

  return (
    <div className="w-64 min-h-screen p-4 text-white" style={{ background: "#0a0f1e" }}>
      <div className="rounded-2xl bg-[rgba(15,23,42,0.45)] border border-[rgba(255,255,255,0.12)] backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-white mb-7">EventFi</h1>

        <div className="space-y-2">
          <button
            onClick={() => setView("home")}
            className="w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-200 border border-transparent hover:border-purple-500 hover:bg-[rgba(124,58,237,0.2)]"
          >
            <Home className="h-4 w-4 text-[#7c3aed]" />
            <span className="text-sm font-medium">Eventos</span>
          </button>

          {user?.role === "cliente" && (
            <button
              onClick={() => setView("profile")}
              className="w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-200 border border-transparent hover:border-cyan-400 hover:bg-[rgba(6,182,212,0.2)]"
            >
              <Ticket className="h-4 w-4 text-[#06b6d4]" />
              <span className="text-sm font-medium">Mis Tickets</span>
            </button>
          )}

          {user?.role === "organizador" && (
            <button
              onClick={() => setView("organizer")}
              className="w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-200 border border-transparent hover:border-purple-500 hover:bg-[rgba(124,58,237,0.2)]"
            >
              <Users className="h-4 w-4 text-[#7c3aed]" />
              <span className="text-sm font-medium">Organizador</span>
            </button>
          )}

          {user?.role === "admin" && (
            <button
              onClick={() => setView("admin")}
              className="w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-200 border border-transparent hover:border-cyan-400 hover:bg-[rgba(6,182,212,0.2)]"
            >
              <Settings className="h-4 w-4 text-[#06b6d4]" />
              <span className="text-sm font-medium">Admin</span>
            </button>
          )}
        </div>
      </div>

      <button
        onClick={logout}
        className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl border border-[rgba(255,255,255,0.16)] bg-[rgba(124,58,237,0.2)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[rgba(124,58,237,0.35)]"
      >
        <LogOut className="h-4 w-4" />
        Cerrar sesión
      </button>
    </div>
  );
}