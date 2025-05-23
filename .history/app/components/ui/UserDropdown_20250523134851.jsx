"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

export default function UserDropdown() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const closeTimeoutRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(closeTimeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => setOpen(false), 200);
  };

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
    <div
      className="relative inline-block text-left"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {user?.imagen ? (
        <Image
          src={user.imagen}
          alt="Foto de perfil"
          width={44}
          height={44}
          className="rounded-full object-cover border border-gray-300 shadow-lg cursor-pointer"
        />
      ) : (
        <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-md cursor-pointer hover:shadow-xl transition-all">
          {initials}
        </div>
      )}

      {open && (
        <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-xl z-50 overflow-hidden border border-gray-200">
          <ul className="text-sm">
            <li
              onClick={() => router.push("/perfil")}
              className="px-5 py-3 hover:bg-gray-100 cursor-pointer transition"
            >
              <span className="text-gray-800">Cambiar datos</span>
            </li>
            <li
              onClick={() => router.push("/cambiarpassword")}
              className="px-5 py-3 hover:bg-gray-100 cursor-pointer transition"
            >
              <span className="text-gray-800">Cambiar contraseña</span>
            </li>
            <li
              onClick={logout}
              className="px-5 py-3 text-red-600 hover:bg-red-50 cursor-pointer transition"
            >
              Cerrar sesión
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
