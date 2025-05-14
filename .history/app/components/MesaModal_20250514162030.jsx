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
        descuento: 0,
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
  const descuento = lista.reduce((acc, p) => acc + (p.descuento || 0), 0);
  const impuesto = (subtotal - descuento) * 0.18;
  const total = subtotal - descuento + impuesto;

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
      total,
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-orange-600">
            🍽️ Mesa {mesa.numero}
          </h2>
          <button
            onClick={() => {
              refetch?.();
              onClose();
            }}
            className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
          >
            <FaTimes />
          </button>
        </div>

        <div className="mb-3">
          <label className="block text-sm font-semibold mb-1">
            <FaUser className="inline mr-1" /> Nombre del cliente
          </label>
          <input
            value={nombreCliente}
            onChange={(e) => setNombreCliente(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Ej: Franco"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4 text-sm font-medium">
          <button
            onClick={enviarPedido}
            className="bg-green-600 hover:bg-green-700 text-white py-2 rounded flex items-center justify-center gap-2"
          >
            <FaPlus /> Enviar
          </button>
          <button className="bg-gray-500 text-white py-2 rounded">
            Cuenta
          </button>
          <button
            onClick={() => setMostrarPago(!mostrarPago)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
          >
            Cobrar
          </button>
          <button
            onClick={eliminarTodo}
            className="col-span-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded"
          >
            Eliminar Comanda
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">
            <GiMeal className="inline mr-1" /> Producto(s)
          </label>
          <select
            value={seleccionado}
            onChange={(e) => setSeleccionado(e.target.value)}
            className="w-full border rounded p-2"
          >
            <option value="">Selecciona un producto</option>
            {productos.map((p) => (
              <option key={p._id} value={p.nombre}>
                {p.nombre}
              </option>
            ))}
          </select>

          {adicionalesDisponibles.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium mb-1">Adicionales:</p>
              <div className="flex flex-wrap gap-2">
                {adicionalesDisponibles.map((ad, idx) => (
                  <label key={idx} className="flex items-center text-xs gap-1">
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
            className="w-full mt-3 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded"
          >
            Agregar Producto
          </button>
        </div>

        <table className="w-full text-xs border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-1 text-left">Descripción</th>
              <th className="p-1">Cant.</th>
              <th className="p-1">Precio</th>
              <th className="p-1">Desc.</th>
              <th className="p-1">Total</th>
              <th className="p-1">Acción</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((p, i) => (
              <tr key={i}>
                <td className="p-1">
                  {p.nombre}
                  {p.adicionales?.length > 0 && (
                    <div className="text-[10px] text-gray-500">
                      + {p.adicionales.join(", ")}
                    </div>
                  )}
                </td>
                <td className="text-center">{p.cantidad}</td>
                <td className="text-center">{p.precio.toFixed(2)}</td>
                <td className="text-center">{p.descuento || 0}</td>
                <td className="text-center">
                  {(p.precio * p.cantidad - (p.descuento || 0)).toFixed(2)}
                </td>
                <td className="text-center">
                  <button onClick={() => eliminarProducto(p.nombre)}>
                    <FaTrash className="text-red-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-right mt-4 text-sm">
          <p>Subtotal: ${subtotal.toFixed(2)}</p>
          <p>Impuesto (18%): ${impuesto.toFixed(2)}</p>
          <p className="font-bold text-lg">Total: ${total.toFixed(2)}</p>
        </div>

        {mostrarPago && (
          <div className="mt-4">
            <label className="text-sm font-medium">
              <FaMoneyBillWave className="inline mr-1" /> Método de Pago:
            </label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="w-full border rounded p-2 mt-1"
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
