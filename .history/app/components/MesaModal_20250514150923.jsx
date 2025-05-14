"use client";
import { useEffect, useState } from "react";
import useProductos from "../hooks/useProductos";
import { FaTrash } from "react-icons/fa";

export default function ModalMesa({ mesa, onClose }) {
  const { productos } = useProductos();
  const [nombreCliente, setNombreCliente] = useState("");
  const [seleccionado, setSeleccionado] = useState("");
  const [lista, setLista] = useState([]);
  const [mostrarPago, setMostrarPago] = useState(false);
  const [metodoPago, setMetodoPago] = useState("");

  const agregarProducto = () => {
    const producto = productos.find((p) => p.nombre === seleccionado);
    if (producto) {
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
        setLista([...lista, { ...producto, cantidad: 1, descuento: 0 }]);
      }
      setSeleccionado("");
    }
  };

  const eliminarProducto = (nombre) => {
    setLista(lista.filter((p) => p.nombre !== nombre));
  };

  const eliminarTodo = () => {
    setLista([]);
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

    const comanda = {
      mesa: mesa.numero,
      codigo: mesa.codigo,
      cliente: nombreCliente,
      productos: lista,
      metodoPago,
      total,
      estado: "pendiente",
      hora: new Date().toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    try {
      await fetch("/api/comandas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(comanda),
      });

      // Actualizar estado de mesa a ocupado
      await fetch("/api/mesas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo: mesa.codigo,
          usuario: nombreCliente,
          hora: comanda.hora,
          estado: "ocupado",
        }),
      });

      alert("Comanda enviada correctamente");
      onClose();
    } catch (error) {
      console.error("Error al enviar comanda:", error);
      alert("Hubo un error al enviar la comanda");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded p-4 shadow-lg text-sm">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-orange-600">
            Piso 01 / Mesa {mesa.numero}
          </h2>
          <button
            onClick={onClose}
            className="bg-black text-white px-4 py-1 rounded"
          >
            Cerrar
          </button>
        </div>

        {/* Nombre Cliente */}
        <div className="mb-2">
          <label className="font-semibold">Nombre del cliente:</label>
          <input
            value={nombreCliente}
            onChange={(e) => setNombreCliente(e.target.value)}
            className="w-full border rounded p-2 mt-1"
            placeholder="Ej: Franco"
          />
        </div>

        {/* Botones */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={enviarPedido}
            className="bg-orange-500 text-white py-2 rounded font-semibold"
          >
            Enviar
          </button>
          <button className="bg-gray-400 text-white py-2 rounded font-semibold">
            Cuenta
          </button>
          <button
            onClick={() => setMostrarPago(!mostrarPago)}
            className="bg-black text-white py-2 rounded font-semibold"
          >
            Cobrar
          </button>
          <button
            onClick={eliminarTodo}
            className="bg-red-600 text-white py-2 rounded font-semibold"
          >
            Eliminar
          </button>
          <button className="bg-orange-400 text-white py-2 rounded font-semibold col-span-2">
            Trasladar
          </button>
        </div>

        {/* Select Productos */}
        <div className="mb-4">
          <label className="font-semibold">Producto(s):</label>
          <select
            value={seleccionado}
            onChange={(e) => setSeleccionado(e.target.value)}
            className="w-full border rounded p-2 mt-1"
          >
            <option value="">Selecciona un producto</option>
            {productos.map((p) => (
              <option key={p._id} value={p.nombre}>
                {p.nombre}
              </option>
            ))}
          </select>
          <button
            onClick={agregarProducto}
            className="w-full mt-2 bg-orange-500 text-white py-2 rounded"
          >
            Agregar
          </button>
        </div>

        {/* Tabla */}
        <table className="w-full border text-xs">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-1 text-left">Descripcion</th>
              <th className="p-1">Cant.</th>
              <th className="p-1">Precio</th>
              <th className="p-1">Desc</th>
              <th className="p-1">Total</th>
              <th className="p-1">Accion</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((p, i) => (
              <tr key={i}>
                <td className="p-1">{p.nombre}</td>
                <td className="p-1 text-center">{p.cantidad}</td>
                <td className="p-1 text-center">{p.precio.toFixed(2)}</td>
                <td className="p-1 text-center">{p.descuento || 0}</td>
                <td className="p-1 text-center">
                  {(p.precio * p.cantidad - (p.descuento || 0)).toFixed(2)}
                </td>
                <td className="p-1 text-center">
                  <button onClick={() => eliminarProducto(p.nombre)}>
                    <FaTrash className="text-red-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales */}
        <div className="text-right mt-3 space-y-1 text-sm">
          <div>Subtotal: {subtotal.toFixed(2)}</div>
          <div>Impuesto 18%: {impuesto.toFixed(2)}</div>
          <div className="font-bold">Total: {total.toFixed(2)}</div>
        </div>

        {/* Método de pago */}
        {mostrarPago && (
          <div className="mt-4">
            <label>Método de Pago:</label>
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
