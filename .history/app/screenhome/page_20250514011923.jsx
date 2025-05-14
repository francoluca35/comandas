"use client";

import PrivateRoute from "../components/PrivateRoute";
import { useAuth } from "@/context/AuthContext";
import BotonesMenu from "../components/BotonesMenu";

export default function ScreenHome() {
  const { logout } = useAuth();

  return (
    <PrivateRoute>
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-white text-2xl font-bold mb-6">Bienvenido 👋</h1>

          <BotonesMenu />

          <button
            onClick={logout}
            className="mt-10 w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-all duration-300"
          >
            Cerrar sesión
          </button>
        </div>
      </main>
    </PrivateRoute>
  );
}
