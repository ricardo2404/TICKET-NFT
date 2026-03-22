"use client";

import { useAuth } from "./AuthContext";
import { motion } from "framer-motion";
// Importación de iconos específicos de Lucide
import { 
  Ticket, 
  User, 
  ShoppingBag, 
  Mic2, 
  Settings, 
  LogOut 
} from "lucide-react";

interface SidebarProps {
  setView: (view: string) => void;
  currentView: string;
}

export default function Sidebar({ setView, currentView }: SidebarProps) {
  const { user, logout } = useAuth();

  // Definición de menú con componentes de iconos
  const menuItems = [
    { id: "home", label: "EVENTOS", icon: Ticket, roles: ["cliente", "organizador", "admin"] },
    { id: "profile", label: "MIS TICKETS", icon: User, roles: ["cliente"] },
    { id: "market", label: "MERCADO", icon: ShoppingBag, roles: ["cliente", "organizador", "admin"] },
    { id: "organizer", label: "ORGANIZADOR", icon: Mic2, roles: ["organizador"] },
    { id: "admin", label: "ADMINISTRACION", icon: Settings, roles: ["admin"] },
  ];

  return (
    <div className="w-72 bg-[#0a0a0b] border-r border-white/5 h-screen p-6 flex flex-col justify-between relative z-20 font-sans">
      <div>
        {/* LOGO EVENTURE */}
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            <span className="font-black text-xl text-white italic">E</span>
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">EVENTFI</h1>
        </div>

        {/* MENU DE NAVEGACION */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (item.roles.includes(user?.role || "")) && (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
                  isActive 
                  ? "bg-white/10 text-white shadow-lg border border-white/10" 
                  : "text-gray-500 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon 
                  size={18} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-all duration-300 ${isActive ? "text-cyan-400" : "group-hover:text-white"}`}
                />
                
                <span className="font-bold text-[11px] tracking-[0.2em] uppercase">
                  {item.label}
                </span>
                
                {isActive && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* SECCION DE USUARIO */}
      <div className="space-y-4">
        <div className="bg-[#161618] p-4 rounded-3xl border border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center text-xs font-black text-purple-400">
            {user?.email?.[0].toUpperCase() || "U"}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-bold text-white truncate lowercase">
              {user?.email?.split('@')[0]}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-gray-600 font-bold">
              {user?.role}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-4 bg-transparent text-gray-500 hover:text-red-500 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all border border-transparent hover:border-red-500/20 hover:bg-red-500/5"
        >
          <LogOut size={14} />
          Cerrar sesion
        </button>
      </div>
    </div>
  );
}