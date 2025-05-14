"use client";

import PrivateRoute from "../components/PrivateRoute";
import { useAuth } from "@/context/AuthContext";
import TablaMetrica from "../components/TablaMetrica";
import BotonesMenu from "../components/BotonesMenu";

export default function ScreenHome() {
  const { user, logout } = useAuth();
  const fecha = new Date().toLocaleDateString("es-AR");

  return (
    <PrivateRoute>
      <main className="min-h-screen bg-gradient-to-br from-[#8B0000] via-black to-[#8B0000] flex flex-col p-4 text-white">
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-semibold">
            Bienvenido {user?.username} - {fecha}
          </h2>
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-xs font-bold">
            CH
          </div>
        </header>

        <section className="flex flex-col lg:flex-row gap-8 items-center justify-between w-full">
          <TablaMetrica />
          <BotonesMenu />
        </section>
      </main>
    </PrivateRoute>
  );
}
