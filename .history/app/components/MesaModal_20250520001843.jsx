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

export default function ModalMesa({ mesa, onClose, refetch }) {
  const { productos } = useProductos();
  const [comidaSeleccionada, setComidaSeleccionada] = useState("");
  const [bebidaSeleccionada, setBebidaSeleccionada] = useState("");
  const comidas = productos.filter((p) => p.tipo !== "bebida");
  const bebidas = productos.filter((p) => p.tipo === "bebida");
  const [mostrarResumen, setMostrarResumen] = useState(false);
  const [nombreCliente, setNombreCliente] = useState("");
  const [mostrarPago, setMostrarPago] = useState(false);
  const [metodoPago, setMetodoPago] = useState("");
  const [adicionalesDisponibles, setAdicionalesDisponibles] = useState([]);
  const [adicionalesSeleccionados, setAdicionalesSeleccionados] = useState([]);
  const [historial, setHistorial] = useState([]); // resumen acumulado
  const [pedidoActual, setPedidoActual] = useState([]); // pedido nuevo

  useEffect(() => {
    if (mesa.estado === "ocupado") {
      setNombreCliente(mesa.cliente || "");
      setHistorial(mesa.productos || []);
      setMetodoPago(mesa.metodoPago || "");
    }
  }, [mesa]);

  useEffect(() => {
    const prod = productos.find((p) => p.nombre === comidaSeleccionada);
    setAdicionalesDisponibles(prod?.adicionales || []);
    setAdicionalesSeleccionados([]);
  }, [comidaSeleccionada]);

  const agregarProducto = () => {
    const producto = productos.find(
      (p) => p.nombre === comidaSeleccionada && p.tipo !== "bebida"
    );
    if (!producto) return;

    const nuevo = {
      ...producto,
      cantidad: 1,
      descuento: producto.descuento || 0,
      adicionales: adicionalesSeleccionados,
    };

    const existente = pedidoActual.find((p) => p.nombre === nuevo.nombre);
    if (existente) {
      setPedidoActual(
        pedidoActual.map((p) =>
          p.nombre === nuevo.nombre ? { ...p, cantidad: p.cantidad + 1 } : p
        )
      );
    } else {
      setPedidoActual([...pedidoActual, nuevo]);
    }

    setComidaSeleccionada("");
    setAdicionalesSeleccionados([]);
  };

  const agregarBebida = () => {
    const bebida = productos.find(
      (p) => p.nombre === bebidaSeleccionada && p.tipo === "bebida"
    );
    if (!bebida) return;

    const nuevo = {
      ...bebida,
      cantidad: 1,
      descuento: bebida.descuento || 0,
      adicionales: [],
    };

    const existente = pedidoActual.find((p) => p.nombre === nuevo.nombre);
    if (existente) {
      setPedidoActual(
        pedidoActual.map((p) =>
          p.nombre === nuevo.nombre ? { ...p, cantidad: p.cantidad + 1 } : p
        )
      );
    } else {
      setPedidoActual([...pedidoActual, nuevo]);
    }

    setBebidaSeleccionada("");
  };

  const eliminarProducto = (nombre) => {
    setPedidoActual(pedidoActual.filter((p) => p.nombre !== nombre));
  };

  const enviarPedido = async () => {
    if (!nombreCliente || pedidoActual.length === 0) {
      alert("Completa el nombre y agrega productos.");
      return;
    }

    const hora = new Date().toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const actualizados = [...historial, ...pedidoActual];

    const total = actualizados.reduce(
      (acc, p) =>
        acc + (p.precio * p.cantidad - (p.descuento || 0) * p.cantidad),
      0
    );
    const totalConIva = total * 1.18;

    const payload = {
      codigo: mesa.codigo,
      numero: mesa.numero,
      cliente: nombreCliente,
      productos: actualizados,
      metodoPago,
      total: totalConIva,
      estado: "ocupado",
      hora,
    };

    try {
      await fetch("/api/mesas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      await fetch("/api/cocina", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mesa: mesa.numero,
          cliente: nombreCliente,
          productos: pedidoActual,
          hora,
        }),
      });

      setHistorial(actualizados);
      setPedidoActual([]);
      alert("Pedido enviado a cocina.");
    } catch (err) {
      console.error("Error:", err);
      alert("Error al enviar pedido.");
    }
  };

  const eliminarComanda = async () => {
    if (!confirm("¿Eliminar toda la comanda y liberar mesa?")) return;

    try {
      await fetch("/api/mesas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo: mesa.codigo,
          cliente: "",
          productos: [],
          metodoPago: "",
          total: 0,
          estado: "libre",
          hora: "",
        }),
      });

      alert("Mesa liberada.");
      location.reload();
    } catch (err) {
      console.error("Error:", err);
      alert("No se pudo liberar mesa.");
    }
  };

  const marcarComoEntregada = async () => {
    try {
      await fetch("/api/cocina", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mesa: mesa.numero }),
      });
      alert("Comida marcada como entregada.");
    } catch (err) {
      alert("Error al eliminar pedido de cocina.");
    }
  };

  const subtotal = historial.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  const descuento = historial.reduce(
    (acc, p) => acc + (p.descuento || 0) * p.cantidad,
    0
  );
  const iva = (subtotal - descuento) * 0.18;
  const total = subtotal - descuento + iva;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white/5 border border-white/10 backdrop-blur-lg w-full max-w-4xl rounded-3xl p-6 shadow-2xl text-white max-h-screen overflow-y-auto">
        {/* HEADER */}
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

        {/* CLIENTE */}
        <div className="mb-3">
          <label className="text-sm flex items-center gap-1 font-medium">
            <FaUser /> Nombre del cliente
          </label>
          <input
            value={nombreCliente}
            onChange={(e) => setNombreCliente(e.target.value)}
            className="w-full px-4 py-2 mt-1 bg-white/10 border border-white/20 rounded-xl placeholder-gray-300 text-white"
            placeholder="Nombre del cliente"
          />
        </div>

        {/* BOTONES */}
        <div className="grid grid-cols-3 gap-3 mb-4 text-sm font-semibold">
          <button
            onClick={enviarPedido}
            className="bg-green-500 hover:bg-green-600 py-2 rounded-xl"
            disabled={pedidoActual.length === 0}
          >
            <FaPlus className="inline mr-1" /> Enviar
          </button>
          <button className="bg-gray-600 py-2 rounded-xl">Cuenta</button>
          <button
            onClick={() => setMostrarPago(!mostrarPago)}
            className="bg-blue-500 hover:bg-blue-600 py-2 rounded-xl"
          >
            Cobrar
          </button>
          <button
            onClick={eliminarComanda}
            className="col-span-3 bg-red-600 hover:bg-red-700 py-2 rounded-xl"
          >
            Eliminar Comanda
          </button>
          <button
            onClick={marcarComoEntregada}
            className="col-span-3 bg-yellow-500 hover:bg-yellow-600 py-2 rounded-xl"
          >
            ✅ Comida entregada
          </button>
        </div>

        {/* FORMULARIO DE PEDIDO */}
        {/* COMIDA */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-1 flex items-center gap-1">
            🍽️ Comida
          </label>
          <select
            value={comidaSeleccionada}
            onChange={(e) => setComidaSeleccionada(e.target.value)}
            className="w-full bg-white/10 text-white border border-white/20 rounded-xl px-3 py-2"
          >
            <option value="">Selecciona una comida</option>
            {comidas.map((p) => (
              <option key={p._id} value={p.nombre}>
                {p.nombre}
              </option>
            ))}
          </select>

          {/* Adicionales */}
          {adicionalesDisponibles.length > 0 && (
            <div className="mt-2 text-xs">
              <p className="font-semibold mb-1">Adicionales:</p>
              <div className="flex flex-wrap gap-2">
                {adicionalesDisponibles.map((a, i) => (
                  <label key={i} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      value={a}
                      checked={adicionalesSeleccionados.includes(a)}
                      onChange={(e) =>
                        setAdicionalesSeleccionados((prev) =>
                          e.target.checked
                            ? [...prev, a]
                            : prev.filter((x) => x !== a)
                        )
                      }
                    />
                    {a}
                  </label>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={agregarProducto}
            className="w-full mt-3 bg-orange-500 hover:bg-orange-600 py-2 rounded-xl font-semibold"
          >
            Agregar Comida
          </button>
        </div>

        {/* BEBIDA */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-1">🥤 Bebida</label>
          <select
            value={bebidaSeleccionada}
            onChange={(e) => setBebidaSeleccionada(e.target.value)}
            className="w-full bg-white/10 text-white border border-white/20 rounded-xl px-3 py-2"
          >
            <option value="">Selecciona una bebida</option>
            {bebidas.map((p) => (
              <option key={p._id} value={p.nombre}>
                {p.nombre}
              </option>
            ))}
          </select>

          <button
            onClick={agregarBebida}
            className="w-full mt-3 bg-orange-500 hover:bg-orange-600 py-2 rounded-xl font-semibold"
          >
            Agregar Bebida
          </button>
        </div>

        {/* TABLA DE PEDIDOS (RESUMEN COMPLETO) */}
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
              {historial.map((p, i) => (
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

        {/* TOTALES */}
        <div className="text-right text-sm mt-6">
          <p>Subtotal: ${subtotal.toFixed(2)}</p>
          <p>Descuento: -${descuento.toFixed(2)}</p>
          <p>IVA: +${iva.toFixed(2)}</p>
          <p className="text-cyan-400 font-bold text-lg mt-1">
            Total: ${total.toFixed(2)}
          </p>
        </div>

        {/* MÉTODO DE PAGO */}
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
    </div>
  );
}
