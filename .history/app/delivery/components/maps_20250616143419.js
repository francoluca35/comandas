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
    const numeroOrden = Date.now(); // Puedes cambiar esto por el real si lo tienes
    const ahora = new Date();
    const horaActual = ahora.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const fechaActual = ahora.toLocaleDateString("es-AR");

    let subtotal = 0;

    let ticket = `<div style="font-family: monospace; font-size: 12px; text-align: center; width: 58mm;">
      <img src="/Assets/Mesas/logo-peru-mar.png" style="width:60px; margin-bottom:5px;" />
      <h2>🍽 Perú Mar</h2>
      <p><b>Mesa:</b> ${pedido.mesa || "-"}</p>
      <p><b>Orden #:</b> ${numeroOrden}</p>
      <p><b>Hora:</b> ${horaActual}</p>
      <p><b>Fecha:</b> ${fechaActual}</p>
      <hr style="border-top:1px dashed #000;">`;

    pedido.comidas.forEach((item) => {
      if (item.comida) {
        const productoComida = productos.find((p) => p.nombre === item.comida);
        const precioComida = productoComida ? productoComida.precio : 0;
        subtotal += precioComida;

        ticket += `<div style="display:flex; justify-content:space-between;">
          <span>1x ${item.comida}</span><span>$${precioComida.toFixed(2)}</span>
        </div>`;

        if (item.adicionales?.length > 0) {
          const adicionalesPrecio = item.adicionales.length * 200;
          subtotal += adicionalesPrecio;
          ticket += `<div style="text-align:left;">+ ${item.adicionales.join(
            ", "
          )} ($${adicionalesPrecio.toFixed(2)})</div>`;
        }
      }

      if (item.bebida) {
        const productoBebida = productos.find((p) => p.nombre === item.bebida);
        const precioBebida = productoBebida ? productoBebida.precio : 0;
        subtotal += precioBebida;

        ticket += `<div style="display:flex; justify-content:space-between;">
          <span>1x ${item.bebida}</span><span>$${precioBebida.toFixed(2)}</span>
        </div>`;
      }
    });

    ticket += `<hr style="border-top:1px dashed #000;">`;

    const descuento = 0;
    const total = pedido.total.toFixed(2);
    const pago = pedido.formaDePago;
    const montoPagado = pedido.total.toFixed(2); // Supongamos siempre exacto
    const vuelto = 0;

    ticket += `
      <div style="text-align:left;">Subtotal: $${subtotal.toFixed(2)}</div>
      <div style="text-align:left;">Descuento: -$${descuento.toFixed(2)}</div>
      <div style="text-align:left;"><b>Total: $${total}</b></div>
      <div style="text-align:left;">Pago: ${pago}</div>
      <div style="text-align:left;">Pagó: $${montoPagado}</div>
      <div style="text-align:left;">Vuelto: $${vuelto.toFixed(2)}</div>
      <hr style="border-top:1px dashed #000;">
      <p style="margin-top:5px;">Tel: 1140660136</p>
      <p>Dirección: Rivera 2525 V. Celina</p>
      <p>Gracias por su visita!</p>
      </div>
  
      <script>window.onload = function() { window.print(); setTimeout(()=>window.close(), 300); }</script>
    `;

    const ventana = window.open("", "_blank", "width=300,height=600");
    ventana.document.write(`<html><body>${ticket}</body></html>`);
    ventana.document.close();
  };

  const handleEnviar = async (pedido) => {
    setEnviandoId(pedido._id);

    // ⬇ Primero imprimimos antes de hacer cualquier llamada asincrónica
    imprimirTicketPOS(pedido);

    try {
      const nuevoEstado =
        pedido.tipo === "delivery" ? "en camino" : "entregado";

      await fetch("/api/maps/estado", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pedido._id, nuevoEstado }),
      });

      if (pedido.tipo === "entregalocal") {
        await fetch("/api/caja-registradora", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ monto: pedido.total }),
        });
      }
      await fetch("/api/informe-diario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalPedido: pedido.total,
          timestamp: new Date(),
        }),
      });

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
