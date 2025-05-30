"use client";

import { useState } from "react";
import useMaps from "@/app/hooks/useMaps";
import BackArrow from "@/app/components/ui/BackArrow";

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
      await refetch();
    } catch (err) {
      console.error("Error al enviar:", err);
    } finally {
      setEnviandoId(null);
    }
  };

  if (loading)
    return <p className="text-white text-center">Cargando pedidos...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-black to-blue-950 text-white px-6 py-12 flex flex-col items-center">
      <div className="w-full max-w-4xl mb-6">
        <BackArrow label="Volver al panel" />
      </div>

      <div className="w-full max-w-4xl rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl p-6">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          📍 Destinos de Entrega
        </h2>

        <ul className="space-y-4">
          {pedidos.map((pedido) => (
            <li
              key={pedido._id}
              className="bg-white/10 border border-white/10 backdrop-blur rounded-xl p-5 shadow-md flex flex-col md:flex-row md:items-center md:justify-between transition hover:scale-[1.01]"
            >
              <div>
                <p className="text-lg font-bold">{pedido.nombre}</p>
                <p className="text-sm text-gray-300">{pedido.direccion}</p>
                <p className="text-xs text-gray-400 mb-1">
                  Fecha: {pedido.fecha}
                </p>
                <p className="text-sm text-gray-400 mb-2">
                  Total: ${pedido.total}
                </p>
                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full font-semibold ${
                    pedido.estado === "entregado"
                      ? "bg-green-600 text-white"
                      : pedido.estado === "en camino"
                      ? "bg-cyan-500 text-black"
                      : "bg-yellow-400 text-black"
                  }`}
                >
                  {pedido.estado.toUpperCase()}
                </span>
              </div>

              <div className="flex gap-2 mt-4 md:mt-0">
                <button
                  onClick={() => handleEnviar(pedido._id)}
                  disabled={
                    pedido.estado !== "en curso" || enviandoId === pedido._id
                  }
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                    pedido.estado === "en curso"
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-gray-500 text-white cursor-not-allowed"
                  }`}
                >
                  Enviar
                </button>

                <button
                  onClick={() => setDetalle(pedido)}
                  className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-xl text-sm font-semibold"
                >
                  Ver info
                </button>

                <a
                  href={pedido.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                >
                  Google Maps
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal de detalle */}
      {detalle && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white text-black p-6 rounded-2xl max-w-lg w-full shadow-2xl relative border border-gray-200">
            <button
              onClick={() => setDetalle(null)}
              className="absolute top-2 right-3 text-red-500 text-xl font-bold hover:scale-110 transition"
            >
              ✕
            </button>

            <h3 className="text-2xl font-bold mb-4">🧾 Detalle del pedido</h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>👤 Nombre:</strong> {detalle.nombre}
              </p>
              <p>
                <strong>📍 Dirección:</strong> {detalle.direccion}
              </p>
              <p>
                <strong>🗓 Fecha:</strong> {detalle.fecha}
              </p>
              <p>
                <strong>💳 Forma de pago:</strong> {detalle.formaDePago}
              </p>
              <p>
                <strong>💰 Total:</strong> ${detalle.total}
              </p>
              <p>
                <strong>📝 Observación:</strong>{" "}
                {detalle.observacion || "Sin observación"}
              </p>
              <div>
                <strong>🍔 Comidas:</strong>
                <ul className="list-disc list-inside mt-1">
                  {detalle.comidas.map((c, i) => (
                    <li key={i}>
                      {c.comida || c.bebida}
                      {c.adicionales?.length > 0 && (
                        <> + {c.adicionales.join(", ")}</>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
