"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

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
    <div className="relative">
      {/* Botón de usuario */}
      <div
        onClick={() => setOpen(!open)}
        className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold text-white cursor-pointer hover:ring-2 hover:ring-orange-400 transition fixed top-4 right-4 z-50"
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
      </div>

      {/* Panel lateral derecho */}
      {open && (
        <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-40 p-4 flex flex-col gap-4 transition-transform duration-300 ease-in-out">
          <h2 className="text-lg font-semibold text-gray-800">Menú</h2>
          <ul className="flex flex-col gap-2">
            <li
              onClick={() => {
                router.push("/perfil");
                setOpen(false);
              }}
              className="cursor-pointer hover:text-orange-500 transition"
            >
              Cambiar datos
            </li>
            <li
              onClick={() => {
                router.push("/cambiarpassword");
                setOpen(false);
              }}
              className="cursor-pointer hover:text-orange-500 transition"
            >
              Cambiar contraseña
            </li>
            <li
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="cursor-pointer text-red-500 hover:text-red-600 transition"
            >
              Cerrar sesión
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
