"use client";
import { useEffect, useState } from "react";
import useProductos from "../hooks/useProductos";
import { FaTrash } from "react-icons/fa";

export default function ModalMesa({ mesa, onClose, refetch }) {
  const { productos } = useProductos();

  const [nombreCliente, setNombreCliente] = useState("");
  const [seleccionado, setSeleccionado] = useState("");
  const [lista, setLista] = useState([]);
  const [mostrarPago, setMostrarPago] = useState(false);
  const [metodoPago, setMetodoPago] = useState("");

  const [adicionalesDisponibles, setAdicionalesDisponibles] = useState([]);
  const [adicionalesSeleccionados, setAdicionalesSeleccionados] = useState([]);

  // Prellenar datos si la mesa ya tiene comanda
  useEffect(() => {
    if (mesa.estado === "ocupado") {
      setNombreCliente(mesa.cliente || "");
      setLista(mesa.productos || []);
      setMetodoPago(mesa.metodoPago || "");
    }
  }, [mesa]);

  // Cargar adicionales si cambia el producto seleccionado
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
      refetch?.();
      onClose();
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
      refetch?.();
      onClose();
    } catch (error) {
      console.error("Error al liberar mesa:", error);
      alert("Hubo un error al liberar la mesa");
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
            onClick={() => {
              refetch?.();
              onClose();
            }}
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

          {/* Adicionales */}
          {adicionalesDisponibles.length > 0 && (
            <div className="mt-2">
              <p className="font-medium text-sm mb-1">Adicionales:</p>
              <div className="flex flex-wrap gap-2">
                {adicionalesDisponibles.map((ad, idx) => (
                  <label
                    key={idx}
                    className="flex items-center space-x-1 text-sm"
                  >
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
                    <span>{ad}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={agregarProducto}
            className="w-full mt-2 bg-orange-500 text-white py-2 rounded"
          >
            Agregar
          </button>
        </div>

        {/* Tabla Productos */}
        <table className="w-full border text-xs">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-1 text-left">Descripción</th>
              <th className="p-1">Cant.</th>
              <th className="p-1">Precio</th>
              <th className="p-1">Desc</th>
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
