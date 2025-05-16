"use client";

import { useState } from "react";
import useMaps from "@/app/hooks/useMaps";

export default function Maps() {
  const { pedidos, loading, refetch } = useMaps();

  const [detalle, setDetalle] = useState(null);
  const [enviandoId, setEnviandoId] = useState(null);

  const handleEnviar = async (id) => {
    setEnviandoId(id);
    try {
      await fetch("/api/maps/estado", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, nuevoEstado: "en camino" }),
      });

      await refetch(); // ⚠️ actualiza pantalla sin recargar
      setEnviandoId(null);
    } catch (err) {
      console.error("Error al enviar:", err);
    }
  };

  if (loading)
    return <p className="text-white text-center">Cargando pedidos...</p>;

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-4xl mx-auto">
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
              <span
                className={`inline-block mt-2 px-2 py-1 text-xs rounded-full font-semibold ${
                  pedido.estado === "entregado"
                    ? "bg-green-600 text-white"
                    : pedido.estado === "en camino"
                    ? "bg-cyan-500 text-black"
                    : "bg-yellow-400 text-black"
                }`}
              >
                {pedido.estado === "en camino"
                  ? "EN CAMINO"
                  : pedido.estado === "en curso"
                  ? "EN CURSO"
                  : pedido.estado.toUpperCase()}
              </span>
            </div>

            <div className="flex gap-2 mt-4 md:mt-0">
              <button
                onClick={() => handleEnviar(pedido._id)}
                disabled={
                  pedido.estado !== "en curso" || enviandoId === pedido._id
                }
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-semibold"
              >
                Enviar
              </button>

              <button
                onClick={() => setDetalle(pedido)}
                className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded text-sm font-semibold"
              >
                ver info
              </button>

              <a
                href={pedido.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-semibold text-white"
              >
                Ver en Google Maps
              </a>
            </div>
          </li>
        ))}
      </ul>

      {detalle && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-lg max-w-lg w-full shadow-xl relative">
            <button
              onClick={() => setDetalle(null)}
              className="absolute top-2 right-2 text-red-600 font-bold"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold mb-3">Detalle del pedido</h3>
            <p>
              <strong>Nombre:</strong> {detalle.nombre}
            </p>
            <p>
              <strong>Dirección:</strong> {detalle.direccion}
            </p>
            <p>
              <strong>Forma de pago:</strong> {detalle.formaDePago}
            </p>
            <p>
              <strong>Total:</strong> ${detalle.total}
            </p>
            <p>
              <strong>Observación:</strong>{" "}
              {detalle.observacion || "Sin observación"}
            </p>
            <p className="mt-3">
              <strong>Comidas:</strong>
            </p>
            <ul className="list-disc pl-5 text-sm">
              {detalle.comidas.map((c, i) => (
                <li key={i}>
                  {c.comida}{" "}
                  {c.adicionales?.length > 0 && (
                    <>+ {c.adicionales.join(", ")}</>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
