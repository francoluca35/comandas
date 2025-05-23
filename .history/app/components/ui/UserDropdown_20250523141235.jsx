"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function UserDropdown({ user, setUser }) {
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef(null);
  const router = useRouter();

  const toggleSidebar = () => setOpen(!open);
  const closeSidebar = () => setOpen(false);

  const handleLogout = () => {
    closeSidebar();
    router.push("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        closeSidebar();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Si no hay usuario, no se muestra el dropdown
  if (!user) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Imagen del usuario que activa el sidebar */}
      <div
        className="cursor-pointer"
        onMouseEnter={toggleSidebar}
        onClick={toggleSidebar}
      >
        <Image
          src={user.imagen || "/default-avatar.png"}
          alt="Usuario"
          width={40}
          height={40}
          className="rounded-full border-2 border-white shadow-md"
        />
      </div>

      {/* Sidebar */}
      {open && (
        <div
          ref={sidebarRef}
          className="fixed top-0 right-0 h-full w-64 bg-[#101c3c] shadow-2xl transition-transform transform translate-x-0 p-4 text-white"
        >
          <div className="flex items-center gap-3 text-xl font-semibold mb-6 border-b border-white/20 pb-4">
            <Image
              src={user.imagen || "/default-avatar.png"}
              alt="Foto de perfil"
              width={40}
              height={40}
              className="rounded-full object-cover border-2 border-white shadow-md"
            />
            <p>{user.nombreCompleto || "Usuario"}</p>
          </div>

          {/* Otros items del menú (puedes agregar más aquí) */}
          <div className="flex flex-col gap-4">
            <button className="text-left hover:opacity-80">Perfil</button>
            <button className="text-left hover:opacity-80">
              Configuración
            </button>
          </div>

          {/* Botón cerrar sesión abajo de todo */}
          <div className="absolute bottom-4 w-full left-0 px-4">
            <button
              onClick={handleLogout}
              className="w-full text-left text-red-400 hover:text-red-200"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
