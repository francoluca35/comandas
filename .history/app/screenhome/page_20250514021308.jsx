"use client";

import PrivateRoute from "../components/PrivateRoute";
import { useAuth } from "@/context/AuthContext";
import TablaMetrica from "../components/TablaMetrica";
import BotonesMenu from "../components/BotonesMenu";
import UserDropdown from "../components/UserDropdown";

export default function ScreenHome() {
  const { user, logout } = useAuth();
  const fecha = new Date().toLocaleDateString("es-AR");

  return (
    <PrivateRoute>
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6 text-white flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-lg font-semibold">
            Bienvenido {user?.username} - {fecha}
          </h2>
          <UserDropdown />
        </div>

        {/* Contenido Principal */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-16 flex-grow">
          <TablaMetrica />
          <BotonesMenu />
        </div>

        {/* Botón Cerrar Sesión */}
        <div className="flex justify-center mt-10">
          <button
            onClick={logout}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition-all duration-300"
          >
            Cerrar sesión
          </button>
        </div>
      </main>
    </PrivateRoute>
  );
}
