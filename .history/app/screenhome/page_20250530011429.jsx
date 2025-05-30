"use client";

import PrivateRoute from "../models/PrivateRoute";
import { useAuth } from "@/context/AuthContext";
import TablaMetrica from "../components/ui/TablaMetrica";
import BotonesMenu from "../components/ui/BotonesMenu";
import UserDropdown from "../components/ui/UserDropdown";
import { Suspense } from "react";

export default function ScreenHome() {
  const { user } = useAuth();
  const fecha = new Date().toLocaleDateString("es-AR");

  return (
    <PrivateRoute>
      <main className="min-h-screen bg-gradient-to-br from-red-900 via-black to-gray-800 p-6 text-white flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-lg font-semibold">
            Bienvenido {user?.nombreCompleto} - {fecha}
          </h2>
          <UserDropdown />
        </div>

        {/* Contenido Principal */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-16 flex-grow">
          <Suspense
            fallback={<p className="text-gray-400">Cargando menú...</p>}
          >
            <BotonesMenu />
          </Suspense>
        </div>
      </main>
    </PrivateRoute>
  );
}
