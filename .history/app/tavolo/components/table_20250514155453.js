"use client";

import Mesas from "@/app/components/Mesas";
import { useEffect, useState } from "react";
import { FaUtensils, FaUser, FaClock } from "react-icons/fa";

export default function Table() {
  const [mesas, setMesas] = useState([]);
  const [pisoActivo, setPisoActivo] = useState("Piso 01");

  const [reload, setReload] = useState("");

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-orange-600">🍽️ Comandas</h2>
        <button
          onClick={reload}
          className="text-orange-600 border border-orange-600 p-2 rounded-full hover:bg-orange-100"
        >
          ⟳
        </button>
      </div>

      {/* Lista de mesas */}
      <Mesas />
    </div>
  );
}
