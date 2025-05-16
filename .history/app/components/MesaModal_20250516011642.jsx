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

  const [nombreCliente, setNombreCliente] = useState("");
  const [seleccionado, setSeleccionado] = useState("");
  const [lista, setLista] = useState([]);
  const [mostrarPago, setMostrarPago] = useState(false);
  const [metodoPago, setMetodoPago] = useState("");
  const [adicionalesDisponibles, setAdicionalesDisponibles] = useState([]);
  const [adicionalesSeleccionados, setAdicionalesSeleccionados] = useState([]);

  useEffect(() => {
    if (mesa.estado === "ocupado") {
      setNombreCliente(mesa.cliente || "");
      setLista(mesa.productos || []);
      setMetodoPago(mesa.metodoPago || "");
    }
  }, [mesa]);

  useEffect(() => {
    const prod = productos.find((p) => p.nombre === seleccionado);
    if (prod && prod.adicionales) {
      setAdicionalesDisponibles(prod.adicionales);
    } else {
      setAdicionalesDisponibles([]);
    }
    setAdicionalesSeleccionados([]);
  }, [seleccionado]);

  const agregarProducto = () => {
    const producto = productos.find((p) => p.nombre === seleccionado);
    if (producto) {
      const nuevoProducto = {
        ...producto,
        cantidad: 1,
        descuento: producto.descuento || 0,
        adicionales: adicionalesSeleccionados,
      };

      const itemExistente = lista.find((p) => p.nombre === producto.nombre);
      if (itemExistente) {
        setLista(
          lista.map((p) =>
            p.nombre === producto.nombre
              ? { ...p, cantidad: p.cantidad + 1 }
              : p
          )
        );
      } else {
        setLista([...lista, nuevoProducto]);
      }

      setSeleccionado("");
      setAdicionalesDisponibles([]);
      setAdicionalesSeleccionados([]);
    }
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
    if (!nombreCliente || lista.length === 0) {
      alert("Completa el nombre y al menos un producto.");
      return;
    }

    const payload = {
      codigo: mesa.codigo,
      cliente: nombreCliente,
      productos: lista,
      metodoPago,
      total: totalConIva,
      estado: "ocupado",
      hora: new Date().toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    try {
      await fetch("/api/mesas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      alert("Comanda guardada correctamente");
      location.reload();
    } catch (error) {
      console.error("Error al guardar comanda:", error);
      alert("Error al guardar comanda");
    }
  };

  const eliminarTodo = async () => {
    const confirm = window.confirm("¿Eliminar pedido y liberar mesa?");
    if (!confirm) return;

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

      alert("Mesa liberada correctamente");
      location.reload();
    } catch (error) {
      console.error("Error al liberar mesa:", error);
      alert("Hubo un error al liberar la mesa");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 w-full max-w-3xl rounded-3xl p-6 shadow-2xl text-white">
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
            className="text-white bg-red-600 hover:bg-red-700 p-2 rounded-full transition"
          >
            <FaTimes />
          </button>
        </div>

        {/* Cliente */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 flex items-center gap-1">
            <FaUser /> Nombre del cliente
          </label>
          <input
            value={nombreCliente}
            onChange={(e) => setNombreCliente(e.target.value)}
            className="w-full bg-white/10 text-white px-4 py-2 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder-gray-300"
            placeholder="Nombre del cliente"
          />
        </div>

        {/* Botones principales */}
        <div className="grid grid-cols-3 gap-3 mb-5 text-sm font-semibold">
          <button
            onClick={enviarPedido}
            className="bg-green-500 hover:bg-green-600 py-2 rounded-xl transition flex items-center justify-center gap-2"
          >
            <FaPlus /> Enviar
          </button>
          <button className="bg-gray-600 text-white py-2 rounded-xl">
            Cuenta
          </button>
          <button
            onClick={() => setMostrarPago(!mostrarPago)}
            className="bg-blue-500 hover:bg-blue-600 py-2 rounded-xl"
          >
            Cobrar
          </button>
          <button
            onClick={eliminarTodo}
            className="col-span-3 bg-red-600 hover:bg-red-700 py-2 rounded-xl"
          >
            Eliminar Comanda
          </button>
        </div>

        {/* Producto */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 flex items-center gap-1">
            <GiMeal /> Producto(s)
          </label>
          <select
            value={seleccionado}
            onChange={(e) => setSeleccionado(e.target.value)}
            className="w-full bg-white/10 text-gray-700 px-3 py-2 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="">Selecciona un producto</option>
            {productos.map((p) => (
              <option key={p._id} value={p.nombre}>
                {p.nombre}
              </option>
            ))}
          </select>

          {/* Adicionales */}
          {adicionalesDisponibles.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium mb-1">Adicionales:</p>
              <div className="flex flex-wrap gap-2">
                {adicionalesDisponibles.map((ad, idx) => (
                  <label key={idx} className="flex items-center text-xs gap-2">
                    <input
                      type="checkbox"
                      value={ad}
                      checked={adicionalesSeleccionados.includes(ad)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setAdicionalesSeleccionados((prev) =>
                          checked
                            ? [...prev, ad]
                            : prev.filter((item) => item !== ad)
                        );
                      }}
                    />
                    {ad}
                  </label>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={agregarProducto}
            className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-xl font-semibold transition"
          >
            Agregar Producto
          </button>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs mt-5 text-white/90">
            <thead className="bg-white/10 rounded-xl">
              <tr>
                <th className="p-2 text-left">Descripción</th>
                <th className="p-2">Cant.</th>
                <th className="p-2">Precio</th>
                <th className="p-2">Desc.</th>
                <th className="p-2">Total</th>
                <th className="p-2">Acción</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((p, i) => (
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
                  <td className="text-center">{p.precio.toFixed(2)}</td>
                  <td className="text-center">
                    {(p.descuento || 0).toFixed(2)}
                  </td>
                  <td className="text-center">
                    {(
                      p.precio * p.cantidad -
                      (p.descuento || 0) * p.cantidad
                    ).toFixed(2)}
                  </td>
                  <td className="text-center">
                    <button onClick={() => eliminarProducto(p.nombre)}>
                      <FaTrash className="text-red-400 hover:text-red-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales */}
        <div className="text-right mt-6 text-sm text-white/80">
          <p className="mb-1">Subtotal: ${subtotal.toFixed(2)}</p>
          <p className="mb-1">Descuento: -${descuento.toFixed(2)}</p>
          <p className="mb-1">IVA (18%): +${iva.toFixed(2)}</p>
          <p className="font-bold text-lg text-cyan-300 mt-2">
            Total con IVA: ${totalConIva.toFixed(2)}
          </p>
        </div>

        {/* Método de pago */}
        {mostrarPago && (
          <div className="mt-6">
            <label className="text-sm font-medium flex items-center gap-1">
              <FaMoneyBillWave /> Método de Pago:
            </label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="w-full px-3 py-2 border border-white/20 rounded-xl bg-white/10 text-white mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
