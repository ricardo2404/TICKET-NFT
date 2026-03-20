"use client";

import { useAuth } from "./AuthContext";

export default function Sidebar({ setView }: any) {
  const { user, logout } = useAuth();

  return (
    <div className="w-64 bg-black text-white h-screen p-4 flex flex-col justify-between">

      <div>
        <h1 className="text-xl font-bold mb-6">EventFi</h1>

        <div className="space-y-2">

          <button
            onClick={() => setView("home")}
            className="w-full text-left p-2 hover:bg-gray-800 rounded transition"
          >
            🎟️ Eventos
          </button>

          {user?.role === "cliente" && (
            <button
              onClick={() => setView("profile")}
              className="w-full text-left p-2 hover:bg-gray-800 rounded"
            >
              👤 Mis Tickets
            </button>
          )}

          {user?.role === "organizador" && (
            <button
              onClick={() => setView("organizer")}
              className="w-full text-left p-2 hover:bg-gray-800 rounded"
            >
              🎤 Organizador
            </button>
          )}

          {user?.role === "admin" && (
            <button
              onClick={() => setView("admin")}
              className="w-full text-left p-2 hover:bg-gray-800 rounded"
            >
              ⚙️ Admin
            </button>
          )}
        </div>
      </div>

      <button
        onClick={logout}
        className="bg-red-600 p-2 rounded mt-4"
      >
        Cerrar sesión
      </button>
    </div>
  );
}