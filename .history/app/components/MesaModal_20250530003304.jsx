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

  const eliminarComanda = async () => {
    const confirmar = confirm(
      "¿Seguro que querés liberar la mesa sin comanda?"
    );
    if (!confirmar) return;

    try {
      await fetch("/api/mesas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo: mesa.codigo,
          numero: mesa.numero,
          productos: [],
          metodoPago: "",
          total: 0,
          estado: "libre",
          hora: "",
          fecha: "",
        }),
      });

      alert("Mesa liberada.");
      refetch?.();
      onClose();
    } catch (err) {
      console.error("Error al liberar mesa:", err);
      alert("No se pudo liberar la mesa.");
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

          <button
            onClick={eliminarComanda}
            className="col-span-2 bg-red-600 hover:bg-red-700 py-2 rounded-xl"
          >
            <FaTrash className="inline mr-2" /> Eliminar Comanda / Liberar Mesa
          </button>
        </div>

        <button
          onClick={() => setMostrarSelector(true)}
          className="w-full mb-4 bg-blue-600 hover:bg-blue-700 py-2 rounded-xl font-semibold"
        >
          Seleccionar con imagen 🍽️🥤
        </button>

        {/* ... resto del componente igual ... */}

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
    </div>
  );
}
