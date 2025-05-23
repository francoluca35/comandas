"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

export default function UserDropdown() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef(null);

  const toggleSidebar = () => setOpen(!open);

  const getInitials = (name) => {
    if (!name) return "CH";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const initials = getInitials(user?.nombreCompleto);

  // Detectar clics fuera del sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative z-50">
      <div onClick={toggleSidebar} className="cursor-pointer">
        {user?.imagen ? (
          <Image
            src={user.imagen}
            alt="Foto de perfil"
            width={40}
            height={40}
            className="rounded-full object-cover border-2 border-white shadow-md"
          />
        ) : (
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold text-white hover:ring-2 hover:ring-orange-400 transition">
            {initials}
          </div>
        )}
      </div>

      {open && (
        <div
          ref={sidebarRef}
          className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg p-6 transition-all duration-300"
        >
          <div className="text-lg font-semibold mb-4">
            {user?.nombreCompleto || "Usuario"}
          </div>
          <ul className="space-y-3 text-sm">
            <li
              onClick={() => router.push("/perfil")}
              className="cursor-pointer hover:text-orange-500"
            >
              Cambiar datos
            </li>
            <li
              onClick={() => router.push("/cambiarpassword")}
              className="cursor-pointer hover:text-orange-500"
            >
              Cambiar contraseña
            </li>
            <li
              onClick={logout}
              className="text-red-500 cursor-pointer hover:text-red-700"
            >
              Cerrar sesión
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
