"use client";

import Mesas from "@/app/components/Mesas";
import { useState } from "react";
import { FaSyncAlt } from "react-icons/fa";

export default function Table() {
  const [pisoActivo, setPisoActivo] = useState("Piso 01");

  const reload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-900 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-orange-400 flex items-center gap-2">
          🍽️ Comandas
        </h2>
        <button
          onClick={reload}
          className="text-orange-400 border border-orange-400 p-2 rounded-full hover:bg-orange-500 hover:text-white transition duration-300"
          title="Recargar"
        >
          <FaSyncAlt />
        </button>
      </div>

      {/* Lista de mesas */}
      <Mesas />
    </div>
  );
}
