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
import { GiMeal } from "react-icons/gi";

export default function ModalMesa({ mesa, onClose, refetch }) {
  const { productos } = useProductos();
  const [comidaSeleccionada, setComidaSeleccionada] = useState("");
  const [bebidaSeleccionada, setBebidaSeleccionada] = useState("");
  const [lista, setLista] = useState([]);
  const [nombreCliente, setNombreCliente] = useState("");
  const [mostrarPago, setMostrarPago] = useState(false);
  const [metodoPago, setMetodoPago] = useState("");
  const [adicionalesDisponibles, setAdicionalesDisponibles] = useState([]);
  const [adicionalesSeleccionados, setAdicionalesSeleccionados] = useState([]);
  const [pedidoEntregado, setPedidoEntregado] = useState(false);

  const comidas = productos.filter((p) => p.tipo !== "bebida");
  const bebidas = productos.filter((p) => p.tipo === "bebida");

  useEffect(() => {
    if (mesa.estado === "ocupado") {
      setNombreCliente(mesa.cliente || "");
      setLista([]);
      setMetodoPago(mesa.metodoPago || "");
    }
  }, [mesa]);

  useEffect(() => {
    const prod = productos.find((p) => p.nombre === comidaSeleccionada);
    setAdicionalesDisponibles(prod?.adicionales || []);
    setAdicionalesSeleccionados([]);
  }, [comidaSeleccionada]);

  const agregarProducto = () => {
    const producto = productos.find((p) => p.nombre === comidaSeleccionada);
    if (!producto) return;

    const nuevoProducto = {
      ...producto,
      cantidad: 1,
      adicionales: adicionalesSeleccionados,
    };

    setLista((prev) => [...prev, nuevoProducto]);
    setPedidoEntregado(false);
    setComidaSeleccionada("");
    setAdicionalesSeleccionados([]);
  };

  const agregarBebida = () => {
    const producto = productos.find((p) => p.nombre === bebidaSeleccionada);
    if (!producto) return;

    const nuevoProducto = {
      ...producto,
      cantidad: 1,
      adicionales: [],
    };

    setLista((prev) => [...prev, nuevoProducto]);
    setPedidoEntregado(false);
    setBebidaSeleccionada("");
  };

  const eliminarProducto = (nombre) => {
    setLista(lista.filter((p) => p.nombre !== nombre));
  };

  const subtotal = lista.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  const descuento = lista.reduce(
    (acc, p) => acc + (p.descuento || 0) * p.cantidad,
    0
  );
  const totalSinIva = subtotal - descuento;
  const iva = totalSinIva * 0.18;
  const totalConIva = totalSinIva + iva;

  const enviarPedido = async () => {
    if (!nombreCliente || lista.length === 0)
      return alert("Completa el nombre y al menos un producto.");

    const hora = new Date().toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const payload = {
      codigo: mesa.codigo,
      numero: mesa.numero,
      cliente: nombreCliente,
      productos: lista,
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
          productos: lista,
          hora,
        }),
      });

      alert("Pedido enviado a cocina.");
      setLista([]);
      setPedidoEntregado(false);
    } catch (error) {
      console.error("Error al enviar:", error);
      alert("Error al enviar pedido.");
    }
  };

  const marcarComidaEntregada = async () => {
    try {
      const res = await fetch("/api/cocina", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mesa: mesa.numero }),
      });
      if (res.ok) {
        alert("Comida marcada como entregada");
        setPedidoEntregado(true);
        setLista([]);
      } else {
        alert("No se pudo marcar como entregado");
      }
    } catch (error) {
      alert("Error al procesar entrega");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 w-full max-w-5xl rounded-3xl p-4 md:p-6 shadow-2xl text-white max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-orange-400 flex items-center gap-2">
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

        {/* Cliente */}
        <div className="mb-4">
          <label className="flex items-center text-sm gap-2">
            <FaUser /> Nombre del cliente
          </label>
          <input
            value={nombreCliente}
            onChange={(e) => setNombreCliente(e.target.value)}
            className="w-full bg-white/10 text-white px-4 py-2 rounded-xl border border-white/20 mt-1"
            placeholder="Nombre"
          />
        </div>

        {/* Botones */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            onClick={enviarPedido}
            disabled={pedidoEntregado || lista.length === 0}
            className={`py-2 rounded-xl font-bold flex justify-center gap-2 items-center transition ${
              pedidoEntregado || lista.length === 0
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            <FaPlus /> Enviar
          </button>
          <button className="bg-gray-600 py-2 rounded-xl">Cuenta</button>
          <button
            onClick={() => setMostrarPago(!mostrarPago)}
            className="bg-blue-500 hover:bg-blue-600 py-2 rounded-xl"
          >
            Cobrar
          </button>
          <button
            onClick={marcarComidaEntregada}
            className="col-span-3 bg-yellow-500 hover:bg-yellow-600 py-2 rounded-xl"
          >
            ✅ Comida entregada
          </button>
        </div>

        {/* Agregar comida */}
        <div className="mb-4">
          <label className="flex items-center text-sm mb-1">
            <GiMeal /> Comida
          </label>
          <select
            value={comidaSeleccionada}
            onChange={(e) => setComidaSeleccionada(e.target.value)}
            className="w-full bg-white/10 text-white px-3 py-2 border border-white/20 rounded-xl"
          >
            <option value="">Selecciona una comida</option>
            {comidas.map((c) => (
              <option key={c._id} value={c.nombre}>
                {c.nombre}
              </option>
            ))}
          </select>
          {adicionalesDisponibles.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {adicionalesDisponibles.map((ad, i) => (
                <label key={i} className="text-xs">
                  <input
                    type="checkbox"
                    checked={adicionalesSeleccionados.includes(ad)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setAdicionalesSeleccionados((prev) =>
                        checked ? [...prev, ad] : prev.filter((x) => x !== ad)
                      );
                    }}
                  />{" "}
                  {ad}
                </label>
              ))}
            </div>
          )}
          <button
            onClick={agregarProducto}
            className="w-full mt-3 bg-orange-500 hover:bg-orange-600 py-2 rounded-xl"
          >
            Agregar Comida
          </button>
        </div>

        {/* Bebida */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">🥤 Bebida</label>
          <select
            value={bebidaSeleccionada}
            onChange={(e) => setBebidaSeleccionada(e.target.value)}
            className="w-full bg-white/10 text-white px-3 py-2 border border-white/20 rounded-xl"
          >
            <option value="">Selecciona una bebida</option>
            {bebidas.map((b) => (
              <option key={b._id} value={b.nombre}>
                {b.nombre}
              </option>
            ))}
          </select>
          <button
            onClick={agregarBebida}
            className="w-full mt-3 bg-orange-500 hover:bg-orange-600 py-2 rounded-xl"
          >
            Agregar Bebida
          </button>
        </div>

        {/* Tabla resumen */}
        <table className="w-full text-xs mt-6">
          <thead>
            <tr className="text-white/70 border-b border-white/10">
              <th className="text-left p-2">Descripción</th>
              <th>Cant.</th>
              <th>Precio</th>
              <th>Total</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((item, i) => (
              <tr key={i} className="border-b border-white/10">
                <td className="p-2">
                  {item.nombre}
                  {item.adicionales?.length > 0 && (
                    <div className="text-xs text-gray-400">
                      + {item.adicionales.join(", ")}
                    </div>
                  )}
                </td>
                <td className="text-center">{item.cantidad}</td>
                <td className="text-center">${item.precio}</td>
                <td className="text-center">
                  ${(item.precio * item.cantidad).toFixed(2)}
                </td>
                <td className="text-center">
                  <button onClick={() => eliminarProducto(item.nombre)}>
                    <FaTrash className="text-red-400 hover:text-red-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales */}
        <div className="text-right mt-6">
          <p>Subtotal: ${subtotal.toFixed(2)}</p>
          <p>Descuento: -${descuento.toFixed(2)}</p>
          <p>IVA: +${iva.toFixed(2)}</p>
          <p className="font-bold text-cyan-300 text-lg">
            Total: ${totalConIva.toFixed(2)}
          </p>
        </div>

        {mostrarPago && (
          <div className="mt-4">
            <label className="text-sm font-medium">
              <FaMoneyBillWave className="inline mr-1" /> Método de pago
            </label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="w-full mt-1 bg-white/10 text-white px-3 py-2 border border-white/20 rounded-xl"
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
