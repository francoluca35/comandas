"use client";

import PrivateRoute from "../components/PrivateRoute";
import { useAuth } from "@/context/AuthContext";
import BotonesMenu from "../components/BotonesMenu";

export default function ScreenHome() {
  const { logout } = useAuth();

  return (
    <PrivateRoute>
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm text-center"></div>
      </main>
    </PrivateRoute>
  );
}
