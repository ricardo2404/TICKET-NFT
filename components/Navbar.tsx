"use client";

import { useAuth } from "./AuthContext";

export default function Navbar({ setView }: any) {
  const { user, logout } = useAuth();

  return (
    <div className="bg-black text-white p-4 flex justify-between items-center">
      <h1 className="font-bold">EventFi</h1>

      <div className="flex gap-3">
        <button onClick={() => setView("home")}>Eventos</button>

        {user?.role === "cliente" && (
          <button onClick={() => setView("profile")}>Mis Tickets</button>
        )}

        {user?.role === "organizador" && (
          <button onClick={() => setView("organizer")}>Organizador</button>
        )}

        {user?.role === "admin" && (
          <button onClick={() => setView("admin")}>Admin</button>
        )}
      </div>

      <button onClick={logout}>Salir</button>
    </div>
  );
}