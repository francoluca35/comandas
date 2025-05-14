"use client";
import { useEffect, useState } from "react";
import useProductos from "@/hooks/useProductos";
import { FaTrash } from "react-icons/fa";

export default function ModalMesa({ mesa, onClose }) {
  const { productos } = useProductos();
  const [seleccionado, setSeleccionado] = useState("");
  const [lista, setLista] = useState([]);

  const agregarProducto = () => {
    if (seleccionado) {
      const producto = productos.find((p) => p.nombre === seleccionado);
      if (producto) {
        setLista([...lista, { ...producto, cantidad: 1 }]);
        setSeleccionado("");
      }
    }
  };

  const eliminarProducto = (nombre) => {
    setLista(lista.filter((p) => p.nombre !== nombre));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded shadow-lg p-4">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-xl font-bold">Mesa {mesa.numero}</h2>
          <button
            onClick={onClose}
            className="text-white bg-black px-3 py-1 rounded"
          >
            Cerrar
          </button>
        </div>

        <div className="mb-4">
          <select
            className="w-full border rounded p-2"
            value={seleccionado}
            onChange={(e) => setSeleccionado(e.target.value)}
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
            className="mt-2 w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600"
          >
            Agregar
          </button>
        </div>

        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">Descripcion</th>
              <th className="p-2">Cant.</th>
              <th className="p-2">Acción</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((p, i) => (
              <tr key={i}>
                <td className="p-2">{p.nombre}</td>
                <td className="p-2">1</td>
                <td className="p-2">
                  <button
                    onClick={() => eliminarProducto(p.nombre)}
                    className="text-red-600"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-right mt-4">
          <strong>Total: </strong>0.00
        </div>
      </div>
    </div>
  );
}
