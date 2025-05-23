"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User, KeyRound, Menu } from "lucide-react";

export default function UserSidebar() {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const toggleSidebar = () => setOpen(!open);

  return (
    <>
      {/* Botón flotante de apertura */}
      <button
        className="fixed top-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition"
        onClick={toggleSidebar}
      >
        {user?.imagen ? (
          <Image
            src={user.imagen}
            alt="Foto de perfil"
            width={40}
            height={40}
            className="rounded-full object-cover border-2 border-white shadow-md"
          />
        ) : (
          initials
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-lg z-40 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-6 space-y-6">
          <h2 className="text-xl font-bold mb-4">Menú</h2>

          <div className="space-y-4">
            <button
              className="flex items-center gap-3 hover:text-orange-400 transition"
              onClick={() => {
                router.push("/perfil");
                setOpen(false);
              }}
            >
              <User className="w-5 h-5" />
              Cambiar datos
            </button>

            <button
              className="flex items-center gap-3 hover:text-orange-400 transition"
              onClick={() => {
                router.push("/cambiarpassword");
                setOpen(false);
              }}
            >
              <KeyRound className="w-5 h-5" />
              Cambiar contraseña
            </button>

            <button
              className="flex items-center gap-3 text-red-400 hover:text-red-500 transition"
              onClick={() => {
                logout();
                setOpen(false);
              }}
            >
              <LogOut className="w-5 h-5" />
              Cerrar sesión
            </button>
          </div>

          <div className="flex-grow" />
          <p className="text-xs text-gray-400">© 2025 Tu Restaurante</p>
        </div>
      </div>
    </>
  );
}
