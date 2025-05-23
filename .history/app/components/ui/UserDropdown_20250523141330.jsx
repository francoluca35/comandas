"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function UserDropdown({ user, setUser }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const containerRef = useRef(null);

  // Manejo de clic fuera del sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Función para cerrar sesión
  const handleLogout = () => {
    setUser(null); // Limpia el estado de usuario
    setOpen(false);
    router.push("/login");
  };

  // Si no hay usuario, no se renderiza nada
  if (!user) return null;

  return (
    <div ref={containerRef} className="fixed top-4 right-4 z-50">
      {/* Imagen de usuario que abre el sidebar al hacer hover */}
      <div className="cursor-pointer" onMouseEnter={() => setOpen(true)}>
        <Image
          src={user.imagen || "/default-avatar.png"}
          alt="Usuario"
          width={40}
          height={40}
          className="rounded-full border-2 border-white shadow-lg"
        />
      </div>

      {/* Sidebar lateral derecho */}
      {open && (
        <div className="fixed top-0 right-0 h-full w-64 bg-[#0e1a35] text-white shadow-2xl p-5 transition duration-300 ease-in-out">
          {/* Encabezado con imagen y nombre */}
          <div className="flex items-center gap-3 mb-6 border-b border-white/20 pb-4 text-lg font-semibold">
            <Image
              src={user.imagen || "/default-avatar.png"}
              alt="Foto de perfil"
              width={40}
              height={40}
              className="rounded-full object-cover border-2 border-white"
            />
            <span>{user.nombreCompleto || "Usuario"}</span>
          </div>

          {/* Links o acciones adicionales */}
          <div className="flex flex-col gap-4">
            <button className="hover:text-gray-300 text-left">Perfil</button>
            <button className="hover:text-gray-300 text-left">
              Configuración
            </button>
          </div>

          {/* Cerrar sesión abajo de todo */}
          <div className="absolute bottom-4 w-full left-0 px-5">
            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-200 text-left w-full"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
