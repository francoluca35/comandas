"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { LogOut, UserCog, Lock } from "lucide-react";

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

      {/* SIDEBAR */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-64 transform ${
          open ? "translate-x-0" : "translate-x-full"
        } bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white shadow-lg transition-transform duration-300 ease-in-out p-6 z-50 rounded-l-xl`}
      >
        <div className="text-xl font-semibold mb-6 border-b border-white/20 pb-4">
          {user?.nombreCompleto || "Usuario"}
        </div>
        <ul className="space-y-4 text-sm">
          <li
            onClick={() => {
              router.push("/perfil");
              setOpen(false);
            }}
            className="flex items-center gap-2 cursor-pointer hover:text-orange-400 transition"
          >
            <UserCog size={18} />
            Cambiar datos
          </li>
          <li
            onClick={() => {
              router.push("/cambiarpassword");
              setOpen(false);
            }}
            className="flex items-center gap-2 cursor-pointer hover:text-orange-400 transition"
          >
            <Lock size={18} />
            Cambiar contraseña
          </li>
          <li
            onClick={() => {
              logout();
              setOpen(false);
            }}
            className="flex items-center gap-2 text-red-400 hover:text-red-600 cursor-pointer transition"
          >
            <LogOut size={18} />
            Cerrar sesión
          </li>
        </ul>
      </div>
    </div>
  );
}
