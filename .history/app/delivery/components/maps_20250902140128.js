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
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [mostrarModalDescripcion, setMostrarModalDescripcion] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [descripcionRepartidor, setDescripcionRepartidor] = useState("");
  const itemsPorPagina = 10;

  const handleExportarExcel = async () => {
    if (!desde || !hasta) {
      alert("Seleccioná ambas fechas");
      return;
    }

    const url = `/api/maps/export?desde=${desde}&hasta=${hasta}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = `Pedidos_${desde}_a_${hasta}.xlsx`;
    link.click();
  };

  const imprimirTicketPOS = async (pedido) => {
    const fecha = new Date().toLocaleDateString("es-AR");
    const hora = new Date().toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Argentina/Buenos_Aires",
    });

    const orden = Date.now();
    const encabezado = pedido.tipo === "delivery" ? "DELIVERY" : "PARA LLEVAR";

    let subtotal = 0;

    const productosHTML = pedido.comidas
      .map((item) => {
        let nombre = item.comida || item.bebida || "";
        let precio = 0;

        if (item.comida) {
          const p = productos.find((prod) => prod.nombre === item.comida);
          precio = p?.precio || 0;
          subtotal += precio;

          if (item.adicionales?.length > 0) {
            const adicTotal = item.adicionales.length * 200;
            subtotal += adicTotal;
            return `
              <div class="item"><span>1x ${
                item.comida
              }</span><span>$${precio.toFixed(2)}</span></div>
              <div style="text-align:left;">+ ${item.adicionales.join(
                ", "
              )} ($${adicTotal.toFixed(2)})</div>
              ${item.observacion ? `<div class="observacion">📝 ${item.observacion}</div>` : ''}
            `;
          }
        }

        if (item.bebida) {
          const p = productos.find((prod) => prod.nombre === item.bebida);
          precio = p?.precio || 0;
          subtotal += precio;
        }

        return `<div class="item"><span>1x ${nombre}</span><span>$${precio.toFixed(
          2
        )}</span></div>
              ${item.observacion ? `<div class="observacion">📝 ${item.observacion}</div>` : ''}`;
      })
      .join("");

    const totalFinal = pedido.total.toFixed(2);
    const descuento = 0;
    const pago = pedido.formaDePago;
    const montoPagado = totalFinal;
    const vuelto = 0;

    // COBRO AUTOMÁTICO: Solo se cobra cuando se imprime el ticket de pago
    if (pago.toLowerCase() === "efectivo") {
      await fetch("/api/tickets/pago-confirmado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mesa: pedido.nombre || "Delivery",
          total: pedido.total,
          metodoPago: pago,
        }),
      });
    }

    const html = `
      <html>
        <head>
          <style>
            @page { size: 58mm auto; margin: 0; }
            @media print {
              html, body {
                width: 54mm;
                margin: 0;
                padding: 0;
                transform: scale(0.90);
                transform-origin: top left;
              }
            }
            body {
              font-family: monospace;
              font-size: 12px;
              width: 52mm;
              margin: 0;
              text-align: center;
            }
            h2 { margin: 5px 0; font-size: 14px; }
            .logo { width: 100px; margin-bottom: 5px; filter: grayscale(100%) contrast(200%); }
            hr { border: none; border-top: 1px dashed #000; margin: 5px 0; }
            .item { display: flex; justify-content: space-between; margin: 2px 0; font-weight: bold; }
            .observacion { font-size: 10px; color: #666; font-style: italic; margin-top: 2px; text-align: left; }
            .total { font-weight: bold; font-size: 14px; }
            .footer { font-size: 10px; margin-top: 8px; }
          </style>
        </head>
        <body>
          <img src="${
            window.location.origin
          }/Assets/logo-tick.png" class="logo" />
          <h1>${encabezado}</h1>
          <h1>Orden #: ${orden}</h1>
          <h1>Hora: ${hora}</h1>
          <h1>Fecha: ${fecha}</h1>
          <hr />
          ${productosHTML}
          <hr />
          <div class="item"><span>Subtotal:</span><span>$${subtotal.toFixed(
            2
          )}</span></div>
          <div class="item"><span>Descuento:</span><span>-$${descuento.toFixed(
            2
          )}</span></div>
          <div class="item total"><span>Total:</span><span>$${totalFinal}</span></div>
          ${pedido.direccion ? `<div class="item"><span>Dirección:</span><span>${pedido.direccion}</span></div>` : ''}
          <div class="item"><span>Pago:</span><span>${pago}</span></div>
          <div class="item"><span>Pagó:</span><span>$${montoPagado}</span></div>
          <div class="item"><span>Vuelto:</span><span>$${vuelto.toFixed(
            2
          )}</span></div>
          <hr />
          <div class="footer">
            <h1>Tel: 1140660136</h1>
            <h1>Dirección: Rivera 2495 V. Celina</h1>
            <h1>Gracias por su visita!</h1>
          </div>
          <script>window.onload = function() { window.print(); setTimeout(()=>window.close(), 500); }</script>
        </body>
      </html>
    `;

    const ventana = window.open("", "_blank", "width=400,height=600");
    if (ventana) {
      ventana.document.write(html);
      ventana.document.close();
    }
  };

  const handleEnviar = async (pedido) => {
    setPedidoSeleccionado(pedido);
    setMostrarModalDescripcion(true);
  };

  const confirmarEnvio = async () => {
    if (!pedidoSeleccionado) return;

    setEnviandoId(pedidoSeleccionado._id);

    imprimirTicketPOS(pedidoSeleccionado);

    try {
      const nuevoEstado =
        pedidoSeleccionado.tipo === "delivery" ? "en camino" : "entregado";

      // Actualizar el pedido con la descripción del repartidor
      await fetch("/api/pedidos/actualizar-descripcion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: pedidoSeleccionado._id,
          descripcionRepartidor: descripcionRepartidor,
        }),
      });

      await fetch("/api/maps/estado", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pedidoSeleccionado._id, nuevoEstado }),
      });

      // ELIMINADO: No se cobra automáticamente al enviar el pedido
      // El cobro se realizará solo cuando se imprima el ticket de pago

      await refetch();

      // Cerrar modal y limpiar estado
      setMostrarModalDescripcion(false);
      setPedidoSeleccionado(null);
      setDescripcionRepartidor("");
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

  const inicio = (paginaActual - 1) * itemsPorPagina;
  const fin = inicio + itemsPorPagina;
  const pedidosPaginados = pedidosFiltrados.slice(inicio, fin);
  const totalPaginas = Math.ceil(pedidosFiltrados.length / itemsPorPagina);

  const renderizarBotones = () => {
    const botones = [];
    const maxBotones = 5;

    if (totalPaginas <= maxBotones) {
      for (let i = 1; i <= totalPaginas; i++) {
        botones.push(i);
      }
    } else {
      if (paginaActual <= 3) {
        for (let i = 1; i <= 4; i++) {
          botones.push(i);
        }
        botones.push("...");
        botones.push(totalPaginas);
      } else if (paginaActual >= totalPaginas - 2) {
        botones.push(1);
        botones.push("...");
        for (let i = totalPaginas - 3; i <= totalPaginas; i++) {
          botones.push(i);
        }
      } else {
        botones.push(1);
        botones.push("...");
        for (let i = paginaActual - 1; i <= paginaActual + 1; i++) {
          botones.push(i);
        }
        botones.push("...");
        botones.push(totalPaginas);
      }
    }

    return botones;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-black to-blue-950 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <BackArrow />
            <h1 className="text-2xl font-bold text-white">Panel de Delivery</h1>
          </div>
        </div>

        <div className="flex gap-4 mb-6 justify-center">
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

        <div className="w-full max-w-5xl mx-auto rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl p-6">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            📍 Pedidos
          </h2>
          <div className="w-full max-w-4xl mx-auto mb-6 bg-white/10 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-center">
            <label className="text-sm">
              Desde:{" "}
              <input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                className="text-black bg-white rounded px-2 py-1 ml-1"
              />
            </label>
            <label className="text-sm">
              Hasta:{" "}
              <input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                className="text-black bg-white rounded px-2 py-1 ml-1"
              />
            </label>
            <button
              onClick={handleExportarExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl"
            >
              📥 Descargar Excel
            </button>
          </div>

          <ul className="space-y-4">
            {pedidosPaginados.map((pedido) => (
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
                        ? "bg-green-100 text-green-800"
                        : pedido.estado === "en camino"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {pedido.estado}
                  </span>
                </div>

                <div className="flex gap-2 mt-4 md:mt-0">
                  <button
                    onClick={() => setDetalle(pedido)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    Ver Detalle
                  </button>
                  {pedido.tipo === "delivery" && (
                    <a
                      href={`/vermapa?id=${pedido._id}`}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm"
                    >
                      Ver Mapa
                    </a>
                  )}
                  <button
                    onClick={() => handleEnviar(pedido)}
                    disabled={enviandoId === pedido._id}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      enviandoId === pedido._id
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-orange-600 hover:bg-orange-700 text-white"
                    }`}
                  >
                    {enviandoId === pedido._id ? "Enviando..." : "Enviar"}
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Paginación */}
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
              disabled={paginaActual === 1}
              className="px-3 py-1 rounded-lg bg-white/10 text-white disabled:opacity-40"
            >
              ◀
            </button>

            {renderizarBotones().map((num, i) =>
              num === "..." ? (
                <span key={i} className="px-3 py-1 text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  key={i}
                  onClick={() => setPaginaActual(num)}
                  className={`px-3 py-1 rounded-lg ${
                    paginaActual === num
                      ? "bg-cyan-600 text-white"
                      : "bg-white/10 text-gray-200"
                  }`}
                >
                  {num}
                </button>
              )
            )}

            <button
              onClick={() =>
                setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))
              }
              disabled={paginaActual === totalPaginas}
              className="px-3 py-1 rounded-lg bg-white/10 text-white disabled:opacity-40"
            >
              ▶
            </button>
          </div>
        </div>

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
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        detalle.direccion
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      📍 Ver en Google Maps
                    </a>
                  </div>
                )}
                
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => {
                      imprimirTicketPOS(detalle);
                      setDetalle(null);
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    🖨️ Imprimir Ticket
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal para descripción del repartidor */}
        {mostrarModalDescripcion && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-white text-black p-6 rounded-2xl max-w-lg w-full shadow-2xl relative">
              <button
                onClick={() => {
                  setMostrarModalDescripcion(false);
                  setPedidoSeleccionado(null);
                  setDescripcionRepartidor("");
                }}
                className="absolute top-2 right-3 text-red-500 text-xl font-bold hover:scale-110"
              >
                ✕
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold">
                  📝 Descripción para Repartidor
                </h3>
              </div>

              <div className="mb-4">
                <p className="text-gray-600 mb-2">
                  <strong>Cliente:</strong> {pedidoSeleccionado?.nombre}
                </p>
                <p className="text-gray-600 mb-4">
                  <strong>Dirección:</strong> {pedidoSeleccionado?.direccion}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Información adicional para el repartidor:
                </label>
                <textarea
                  value={descripcionRepartidor}
                  onChange={(e) => setDescripcionRepartidor(e.target.value)}
                  placeholder="Ej: Edificio azul, timbre 3B, llamar antes de subir, portón cerrado, etc."
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Describe cualquier detalle importante sobre el lugar de
                  entrega
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setMostrarModalDescripcion(false);
                    setPedidoSeleccionado(null);
                    setDescripcionRepartidor("");
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarEnvio}
                  disabled={enviandoId === pedidoSeleccionado?._id}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    enviandoId === pedidoSeleccionado?._id
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {enviandoId === pedidoSeleccionado?._id
                    ? "Enviando..."
                    : "Confirmar Envío"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
