"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { X } from "lucide-react"; // Ícono de cerrar (requiere `lucide-react`)

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

      {/* Fondo oscuro al abrir sidebar */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Panel lateral derecho */}
      <div
        className={`fixed top-0 right-0 h-full w-72 sm:w-80 bg-white z-50 shadow-lg transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Encabezado del panel */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="font-semibold text-lg text-gray-800">Mi Cuenta</div>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-500 hover:text-red-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Opciones del menú */}
        <ul className="flex flex-col py-4 text-gray-800 text-sm">
          <li
            onClick={() => {
              router.push("/perfil");
              setOpen(false);
            }}
            className="px-6 py-3 hover:bg-gray-100 cursor-pointer"
          >
            Cambiar datos
          </li>
          <li
            onClick={() => {
              router.push("/cambiarpassword");
              setOpen(false);
            }}
            className="px-6 py-3 hover:bg-gray-100 cursor-pointer"
          >
            Cambiar contraseña
          </li>
          <li
            onClick={() => {
              logout();
              setOpen(false);
            }}
            className="px-6 py-3 text-red-600 hover:bg-red-50 cursor-pointer"
          >
            Cerrar sesión
          </li>
        </ul>
      </div>
    </>
  );
}
