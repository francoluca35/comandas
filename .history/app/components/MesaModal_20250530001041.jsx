"use client";

import { useEffect, useState } from "react";
import useProductos from "../hooks/useProductos";
import {
  FaTrash,
  FaUser,
  FaMoneyBillWave,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import Resumen from "./Resumen";
import CobrarCuentaModal from "../cobrarCuenta/component/CobrarCuentaModal";
import SelectorProductos from "../components/ui/SelectorProductos";

export default function ModalMesa({ mesa, onClose, refetch }) {
  const { productos } = useProductos();
  const [mostrarResumen, setMostrarResumen] = useState(false);
  const [mostrarPago, setMostrarPago] = useState(false);
  const [mostrarCobro, setMostrarCobro] = useState(false);
  const [mostrarSelector, setMostrarSelector] = useState(false);
  const [pedidoActual, setPedidoActual] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [metodoPago, setMetodoPago] = useState("");

  useEffect(() => {
    if (mesa.estado === "ocupado") {
      setHistorial(mesa.productos || []);
      setMetodoPago(mesa.metodoPago || "");
    }
  }, [mesa]);

  const imprimirTicket = (orden, hora, fecha) => {
    const nuevaVentana = window.open("", "Ticket", "width=300,height=600");
    const comidas = pedidoActual.filter((p) => p.tipo !== "bebida");
    const bebidas = pedidoActual.filter((p) => p.tipo === "bebida");
    const urlSitio = "https://francomputer.com.ar";

    const html = `
      <html>
        <head>
          <style>
            body { font-family: monospace; font-size: 12px; padding: 10px; text-align: center; }
            h2 { margin: 10px 0 5px; }
            img.logo { width: 80px; margin-bottom: 10px; }
            hr { border: none; border-top: 1px dashed #000; margin: 10px 0; }
            ul { text-align: left; padding-left: 0; list-style: none; }
          </style>
        </head>
        <body>
          <img src="${window.location.origin}/logo-peru-mar.png" class="logo" />
          <h2>🍽️ Perú Mar</h2>
          <p><strong>Mesa:</strong> ${mesa.numero}</p>
          <p><strong>Orden #:</strong> ${orden}</p>
          <p><strong>Hora:</strong> ${hora}</p>
          <p><strong>Fecha:</strong> ${fecha}</p>
          <hr />
          <p><strong>Comidas:</strong></p>
          <ul>
            ${comidas
              .map((p) => `<li>${p.cantidad}x ${p.nombre}</li>`)
              .join("")}
          </ul>
          <p><strong>Bebidas:</strong></p>
          <ul>
            ${bebidas
              .map((p) => `<li>${p.cantidad}x ${p.nombre}</li>`)
              .join("")}
          </ul>
          <hr />
          <p><strong>Visítanos:</strong></p>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
            urlSitio
          )}" />
          <p style="font-size: 10px; margin-top: 5px;">${urlSitio}</p>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `;

    nuevaVentana.document.write(html);
    nuevaVentana.document.close();
  };

  const enviarPedido = async () => {
    if (!pedidoActual.length) {
      alert("Agrega productos antes de enviar.");
      return;
    }

    const hora = new Date().toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const fecha = new Date().toLocaleDateString("es-AR");
    const orden = Date.now();

    imprimirTicket(orden, hora, fecha);

    const productosTotales = [...historial, ...pedidoActual];
    const total = productosTotales.reduce(
      (acc, p) =>
        acc + (p.precio * p.cantidad - (p.descuento || 0) * p.cantidad),
      0
    );

    try {
      await fetch("/api/mesas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo: mesa.codigo,
          numero: mesa.numero,
          productos: productosTotales,
          metodoPago,
          total,
          estado: "ocupado",
          hora,
          fecha,
        }),
      });

      setHistorial(productosTotales);
      setPedidoActual([]);
      refetch?.();
      alert("Pedido enviado e impreso correctamente.");
    } catch (err) {
      console.error("Error al actualizar mesa:", err);
      alert("No se pudo enviar el pedido.");
    }
  };

  const todosLosProductos = [...historial, ...pedidoActual];
  const subtotal = todosLosProductos.reduce(
    (acc, p) => acc + p.precio * p.cantidad,
    0
  );
  const descuento = todosLosProductos.reduce(
    (acc, p) => acc + (p.descuento || 0) * p.cantidad,
    0
  );
  const iva = (subtotal - descuento) * 0.18;
  const total = subtotal - descuento + iva;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white/5 border border-white/10 backdrop-blur-lg w-full max-w-4xl rounded-3xl p-6 shadow-2xl text-white max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-orange-400">
            🍽️ Mesa {mesa.numero}
          </h2>
          <button
            onClick={() => {
              refetch?.();
              onClose();
            }}
            className="bg-red-600 hover:bg-red-700 p-2 rounded-full"
          >
            <FaTimes />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4 text-sm font-semibold">
          <button
            onClick={enviarPedido}
            className="bg-green-500 hover:bg-green-600 py-2 rounded-xl w-full"
            disabled={pedidoActual.length === 0}
          >
            <FaPlus className="inline mr-1" /> Enviar
          </button>

          <button
            onClick={() => setMostrarCobro(true)}
            className="bg-gray-600 text-white hover:bg-gray-700 py-2 rounded-xl w-full"
          >
            Cobrar Cuenta
          </button>
        </div>

        <button
          onClick={() => setMostrarSelector(true)}
          className="w-full mb-4 bg-blue-600 hover:bg-blue-700 py-2 rounded-xl font-semibold"
        >
          Seleccionar con imagen 🍽️🥤
        </button>

        <div className="overflow-x-auto mt-6">
          <table className="w-full text-xs">
            <thead className="bg-white/10">
              <tr>
                <th className="p-2 text-left">Descripción</th>
                <th className="p-2">Cant.</th>
                <th className="p-2">Precio</th>
                <th className="p-2">Desc.</th>
                <th className="p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {todosLosProductos.map((p, i) => (
                <tr key={i} className="border-t border-white/10">
                  <td className="p-2">
                    {p.nombre}
                    {p.adicionales?.length > 0 && (
                      <div className="text-[10px] text-gray-400">
                        + {p.adicionales.join(", ")}
                      </div>
                    )}
                  </td>
                  <td className="text-center">{p.cantidad}</td>
                  <td className="text-center">{p.precio}</td>
                  <td className="text-center">{p.descuento || 0}</td>
                  <td className="text-center">
                    {(
                      p.precio * p.cantidad -
                      (p.descuento || 0) * p.cantidad
                    ).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-right text-sm mt-6">
          <p>Subtotal: ${subtotal.toFixed(2)}</p>
          <p>Descuento: -${descuento.toFixed(2)}</p>
          <p>IVA: +${iva.toFixed(2)}</p>
          <p className="text-cyan-400 font-bold text-lg mt-1">
            Total: ${total.toFixed(2)}
          </p>
        </div>

        {mostrarPago && (
          <div className="mt-6">
            <label className="text-sm font-medium flex items-center gap-1">
              <FaMoneyBillWave /> Método de pago
            </label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-white/20 rounded-xl bg-white/10 text-white"
            >
              <option value="">Selecciona</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </div>
        )}
      </div>

      {mostrarResumen && (
        <Resumen mesa={mesa} onClose={() => setMostrarResumen(false)} />
      )}
      {mostrarCobro && (
        <CobrarCuentaModal
          onClose={() => setMostrarCobro(false)}
          mesa={mesa}
          productos={todosLosProductos}
          total={total}
          refetch={refetch}
        />
      )}
      {mostrarSelector && (
        <SelectorProductos
          productos={productos}
          onSelect={(producto) => {
            const nuevo = {
              ...producto,
              descuento: producto.descuento || 0,
              adicionales: [],
            };

            const existente = pedidoActual.find(
              (p) => p.nombre === nuevo.nombre
            );
            if (existente) {
              setPedidoActual(
                pedidoActual.map((p) =>
                  p.nombre === nuevo.nombre
                    ? { ...p, cantidad: p.cantidad + producto.cantidad }
                    : p
                )
              );
            } else {
              setPedidoActual([...pedidoActual, nuevo]);
            }
          }}
          onClose={() => setMostrarSelector(false)}
        />
      )}
    </div>
  );
}
