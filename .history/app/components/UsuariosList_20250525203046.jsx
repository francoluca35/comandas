"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import UserDropdown from "./ui/UserDropdown";

function formatHora(fecha) {
  if (!fecha) return "-";
  return new Date(fecha).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function calcularDuracion(inicio, fin) {
  if (!inicio) return "-";
  const inicioDate = new Date(inicio);
  const finDate = fin ? new Date(fin) : new Date();

  const diffMs = finDate - inicioDate;
  const seg = Math.floor(diffMs / 1000);
  const h = String(Math.floor(seg / 3600)).padStart(2, "0");
  const m = String(Math.floor((seg % 3600) / 60)).padStart(2, "0");
  const s = String(seg % 60).padStart(2, "0");

  return `${h}:${m}:${s}`;
}

export default function UsuariosList() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isAdmin = user?.rol === "admin";

  useEffect(() => {
    const fetchUsuarios = async () => {
      const res = await fetch("/api/users/all");
      const data = await res.json();
      setUsuarios(data.users);
      setLoading(false);
    };

    fetchUsuarios();
    const interval = setInterval(fetchUsuarios, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (username) => {
    if (!confirm(`¿Seguro que querés eliminar a ${username}?`)) return;
    await fetch("/api/admin/delete-user", {
      method: "POST",
      body: JSON.stringify({ username }),
      headers: { "Content-Type": "application/json" },
    });

    setUsuarios((prev) => prev.filter((u) => u.username !== username));
  };

  const handleForceLogout = async (username) => {
    await fetch("/api/admin/force-logout", {
      method: "POST",
      body: JSON.stringify({ username }),
      headers: { "Content-Type": "application/json" },
    });

    setUsuarios((prev) =>
      prev.map((u) =>
        u.username === username ? { ...u, online: false, fin: new Date() } : u
      )
    );
  };

  if (loading) return <p className="text-white">Cargando usuarios...</p>;

  return (
    <div className="relative min-h-screen bg-gray-950">
      <div className="absolute top-4 right-4 z-50">
        <UserDropdown />
      </div>

      <div className="p-6 bg-gray-900 rounded-xl text-white shadow-xl w-full max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Usuarios</h2>
        <table className="w-full text-sm text-left text-white">
          <thead>
            <tr className="text-orange-400 border-b border-gray-700">
              <th className="py-2">Nombre</th>
              <th className="py-2">Email</th>
              <th className="py-2">Rol</th>
              <th className="py-2">Estado</th>
              <th className="py-2">Inicio</th>
              <th className="py-2">Cierre</th>
              <th className="py-2">Tiempo</th>
              {isAdmin && <th className="py-2 text-center">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.username} className="border-b border-gray-800">
                <td className="py-2">{u.nombreCompleto}</td>
                <td className="py-2 text-gray-300">{u.email}</td>
                <td className="py-2 text-gray-400">{u.rol}</td>
                <td className="py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      u.online
                        ? "bg-green-600 text-white"
                        : "bg-gray-500 text-white"
                    }`}
                  >
                    {u.online ? "Online" : "Offline"}
                  </span>
                </td>
                <td className="py-2">{formatHora(u.inicio)}</td>
                <td className="py-2">{formatHora(u.fin)}</td>
                <td className="py-2">{calcularDuracion(u.inicio, u.fin)}</td>
                {isAdmin && (
                  <td className="py-2 space-x-2 text-center">
                    {u.online && (
                      <button
                        onClick={() => handleForceLogout(u.username)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-xs px-2 py-1 rounded"
                      >
                        Cerrar sesión
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(u.username)}
                      className="bg-red-600 hover:bg-red-700 text-xs px-2 py-1 rounded"
                    >
                      Eliminar Cuenta
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
