"use client";

import PrivateRoute from "../components/PrivateRoute";
import { useAuth } from "@/context/AuthContext";
import BotonesMenu from "@/components/BotonesMenu";

export default function ScreenHome() {
  const { logout } = useAuth();

  return (
    <PrivateRoute>
      <main className="p-6 flex flex-col items-center justify-center min-h-screen bg-white">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">¡Bienvenido!</h1>

        <BotonesMenu />

        <button
          onClick={logout}
          className="mt-10 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Cerrar sesión
        </button>
      </main>
    </PrivateRoute>
  );
}
