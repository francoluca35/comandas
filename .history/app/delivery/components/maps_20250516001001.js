"use client";

import React from "react";
import useMaps from "@/app/hooks/useMaps";

export default function Maps() {
  const { pedidos, loading } = useMaps();

  if (loading)
    return <p className="text-white text-center">Cargando pedidos...</p>;

  if (pedidos.length === 0)
    return <p className="text-center text-gray-400">No hay pedidos en curso</p>;

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-orange-500 mb-6 text-center">
        Destinos de Entrega
      </h2>

      <ul className="space-y-4">
        {pedidos.map((pedido) => (
          <li
            key={pedido._id}
            className="bg-gray-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between shadow"
          >
            <div>
              <p className="text-lg font-semibold">{pedido.nombre}</p>
              <p className="text-sm text-gray-300">{pedido.direccion}</p>
              <p className="text-sm text-gray-400">Total: ${pedido.total}</p>
            </div>
            <a
              href={pedido.mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition"
            >
              Ver en Google Maps
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
