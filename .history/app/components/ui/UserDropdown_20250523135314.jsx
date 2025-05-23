"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { X } from "lucide-react";

export default function UserDropdown() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return "CH";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const initials = getInitials(user?.nombreCompleto);

  return (
    <>
      {/* Botón de perfil */}
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {user?.imagen ? (
          <Image
            src={user.imagen}
            alt="Foto de perfil"
            width={44}
            height={44}
            className="rounded-full object-cover border border-gray-300 shadow-lg"
          />
        ) : (
          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-md hover:shadow-xl transition-all">
            {initials}
          </div>
        )}
      </div>

      {/* Fondo oscuro */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Panel lateral moderno */}
      <div
        className={`fixed top-0 left-0 sm:left-0 h-full w-[260px] bg-gradient-to-br from-[#4e8eff] to-[#5cd8ff] z-50 shadow-lg transform transition-transform duration-300 rounded-r-3xl ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Encabezado con cerrar */}
        <div className="flex justify-between items-center p-4">
          <span className="text-white text-lg font-semibold">Menú</span>
          <button
            onClick={() => setOpen(false)}
            className="text-white hover:text-red-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menú con estilo limpio */}
        <ul className="flex flex-col text-white text-base px-5 py-2 gap-1">
          <li
            onClick={() => {
              router.push("/perfil");
              setOpen(false);
            }}
            className="px-4 py-3 rounded-lg hover:bg-white/20 cursor-pointer transition"
          >
            👤 Cambiar datos
          </li>
          <li
            onClick={() => {
              router.push("/cambiarpassword");
              setOpen(false);
            }}
            className="px-4 py-3 rounded-lg hover:bg-white/20 cursor-pointer transition"
          >
            🔒 Cambiar contraseña
          </li>
          <li
            onClick={() => {
              logout();
              setOpen(false);
            }}
            className="px-4 py-3 mt-2 text-red-100 hover:bg-white/10 cursor-pointer transition"
          >
            🚪 Cerrar sesión
          </li>
        </ul>
      </div>
    </>
  );
}
