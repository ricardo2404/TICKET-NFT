"use client";

import { useState } from "react";
import { useAuth } from "./AuthContext";

export default function Login() {
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [role, setRole] = useState<"cliente" | "organizador">("cliente");

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <div className="bg-white text-black p-6 rounded-xl w-80 space-y-3">

        <h1 className="text-xl font-bold text-center">EventFi</h1>

        <input
          placeholder="Usuario"
          className="w-full border p-2 rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <select
          className="w-full border p-2 rounded"
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
        >
          <option value="cliente">Cliente</option>
          <option value="organizador">Organizador</option>
        </select>

        <button
          onClick={() => {
            if (!username) return;
            login(username, role);
          }}
          className="bg-blue-600 text-white w-full p-2 rounded"
        >
          Entrar
        </button>

      </div>
    </div>
  );
}