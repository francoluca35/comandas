"use client";

import { useState } from "react";
import useMaps from "@/app/hooks/useMaps";
import BackArrow from "@/app/components/ui/BackArrow";
import useProductos from "@/app/hooks/useProductos";

export default function Maps() {
  const { pedidos, loading, refetch } = useMaps();
  const { productos } = useProductos();

  const [detalle, setDetalle] = useState(null);
  const [enviandoId, setEnviandoId] = useState(null);
  const [filtro, setFiltro] = useState("todos");

  const imprimirTicketPOS = (pedido) => {
    let ticket = `<div style="font-family: monospace; font-size: 12px; text-align: center; width: 58mm;">
      <h2>📦 Pedido</h2>
      <p><b>Cliente:</b> ${pedido.nombre}</p>
      ${pedido.direccion ? `<p><b>Dirección:</b> ${pedido.direccion}</p>` : ""}
      <p><b>Fecha:</b> ${pedido.fecha}</p>
      <p><b>Pago:</b> ${pedido.formaDePago}</p>
      <p><b>Observación:</b> ${pedido.observacion || "Ninguna"}</p>
      <hr style="border-top:1px dashed #000;">`;

    pedido.comidas.forEach((item) => {
      if (item.comida) {
        const productoComida = productos.find((p) => p.nombre === item.comida);
        const precioComida = productoComida ? productoComida.precio : 0;
        ticket += `<div style="text-align:left;">🍽 ${
          item.comida
        } - $${precioComida.toFixed(2)}</div>`;
        if (item.adicionales?.length > 0) {
          const adicionalesPrecio = (item.adicionales.length * 200).toFixed(2);
          ticket += `<div style="text-align:left;">+ ${item.adicionales.join(
            ", "
          )} ($${adicionalesPrecio})</div>`;
        }
      }
      if (item.bebida) {
        const productoBebida = productos.find((p) => p.nombre === item.bebida);
        const precioBebida = productoBebida ? productoBebida.precio : 0;
        ticket += `<div style="text-align:left;">🥤 ${
          item.bebida
        } - $${precioBebida.toFixed(2)}</div>`;
      }
    });

    ticket += `<hr style="border-top:1px dashed #000;">
      <p><b>TOTAL: $${pedido.total.toFixed(2)}</b></p>
      <p>¡Gracias por su compra!</p></div>
      <script>window.onload = function() { window.print(); setTimeout(()=>window.close(), 300); }</script>`;

    const ventana = window.open("", "_blank", "width=300,height=600");
    ventana.document.write(`<html><body>${ticket}</body></html>`);
    ventana.document.close();
  };

  const handleEnviar = async (pedido) => {
    setEnviandoId(pedido._id);
    try {
      const nuevoEstado =
        pedido.modoPedido === "delivery" ? "en camino" : "entregado";

      await fetch("/api/maps/estado", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pedido._id, nuevoEstado }),
      });

      // Si es "entregalocal" sumamos el total en caja
      if (pedido.modoPedido === "entregalocal") {
        await fetch("/api/caja/sumar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ monto: pedido.total }),
        });
      }

      imprimirTicketPOS(pedido);
      await refetch();
    } catch (err) {
      console.error("Error al enviar:", err);
    } finally {
      setEnviandoId(null);
    }
  };

  if (loading)
    return <p className="text-white text-center">Cargando pedidos...</p>;

  const pedidosFiltrados = pedidos.filter((pedido) => {
    if (filtro === "todos") return true;
    return pedido.tipo === filtro;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-black to-blue-950 text-white px-6 py-12 flex flex-col items-center">
      <div className="w-full max-w-4xl mb-6">
        <BackArrow label="Volver al panel" />
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFiltro("todos")}
          className={`px-4 py-2 rounded-xl ${
            filtro === "todos" ? "bg-cyan-600" : "bg-white/10"
          } text-white`}
        >
          Todos
        </button>
        <button
          onClick={() => setFiltro("delivery")}
          className={`px-4 py-2 rounded-xl ${
            filtro === "delivery" ? "bg-cyan-600" : "bg-white/10"
          } text-white`}
        >
          Delivery
        </button>
        <button
          onClick={() => setFiltro("entregalocal")}
          className={`px-4 py-2 rounded-xl ${
            filtro === "entregalocal" ? "bg-cyan-600" : "bg-white/10"
          } text-white`}
        >
          Para llevar
        </button>
      </div>

      <div className="w-full max-w-4xl rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl p-6">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          📍 Pedidos
        </h2>

        <ul className="space-y-4">
          {pedidosFiltrados.map((pedido) => (
            <li
              key={pedido._id}
              className="bg-white/10 border border-white/10 rounded-xl p-5 shadow-md flex flex-col md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-lg font-bold">{pedido.nombre}</p>
                {pedido.direccion && (
                  <p className="text-sm text-gray-300">{pedido.direccion}</p>
                )}
                <p className="text-xs text-gray-400 mb-1">
                  Fecha: {pedido.fecha}
                </p>
                <p className="text-sm text-gray-400 mb-2">
                  Total: ${pedido.total}
                </p>
                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full font-semibold ${
                    pedido.estado === "entregado"
                      ? "bg-green-600"
                      : pedido.estado === "en camino"
                      ? "bg-cyan-500"
                      : "bg-yellow-400"
                  }`}
                >
                  {pedido.estado.toUpperCase()}
                </span>
              </div>

              <div className="flex gap-2 mt-4 md:mt-0">
                <button
                  onClick={() => handleEnviar(pedido)}
                  disabled={
                    pedido.estado !== "en curso" || enviandoId === pedido._id
                  }
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                    pedido.estado === "en curso"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-500 cursor-not-allowed"
                  }`}
                >
                  {pedido.tipo === "delivery" ? "Enviar" : "Entregar"}
                </button>

                <button
                  onClick={() => setDetalle(pedido)}
                  className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-xl text-sm font-semibold"
                >
                  Ver info
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal de detalle */}
      {detalle && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white text-black p-6 rounded-2xl max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setDetalle(null)}
              className="absolute top-2 right-3 text-red-500 text-xl font-bold hover:scale-110"
            >
              ✕
            </button>

            <h3 className="text-2xl font-bold mb-4">🧾 Detalle del pedido</h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>👤 Nombre:</strong> {detalle.nombre}
              </p>
              {detalle.tipo === "delivery" && (
                <p>
                  <strong>📍 Dirección:</strong> {detalle.direccion}
                </p>
              )}
              <p>
                <strong>🗓 Fecha:</strong> {detalle.fecha}
              </p>
              <p>
                <strong>💳 Pago:</strong> {detalle.formaDePago}
              </p>
              <p>
                <strong>💰 Total:</strong> ${detalle.total}
              </p>
              <p>
                <strong>📝 Observación:</strong>{" "}
                {detalle.observacion || "Ninguna"}
              </p>

              <div>
                <strong>🍽 Pedido:</strong>
                <ul className="list-disc list-inside mt-1">
                  {detalle.comidas.map((item, i) => (
                    <li key={i}>
                      {item.comida || item.bebida}
                      {item.adicionales?.length > 0 && (
                        <> + {item.adicionales.join(", ")}</>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {detalle.tipo === "delivery" && (
                <div className="mt-3">
                  <a
                    href={detalle.mapsLink}
                    target="_blank"
                    className="text-blue-500 underline"
                  >
                    📍 Ver en Google Maps
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
