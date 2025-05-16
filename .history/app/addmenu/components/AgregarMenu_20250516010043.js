"use client";
import { useState } from "react";
import useAgregarMenu from "@/app/hooks/useAgregarMenu";

export default function AgregarMenu() {
  const { agregarMenu, loading, error, success } = useAgregarMenu();

  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [precioConIVA, setPrecioConIVA] = useState("");
  const [descuento, setDescuento] = useState("");
  const [adicional, setAdicional] = useState("");
  const [adicionales, setAdicionales] = useState([]);

  const handleAgregar = async (e) => {
    e.preventDefault();

    const data = {
      nombre,
      precio: parseInt(precio),
      precioConIVA: parseInt(precioConIVA),
      adicionales,
      ...(descuento && { descuento: parseInt(descuento) }),
    };

    await agregarMenu(data);
    setNombre("");
    setPrecio("");
    setPrecioConIVA("");
    setDescuento("");
    setAdicional("");
    setAdicionales([]);
  };

  const agregarAdicional = () => {
    if (adicional) {
      setAdicionales([...adicionales, adicional]);
      setAdicional("");
    }
  };

  return (
    <div className="w-full px-4 py-10 flex justify-center bg-gradient-to-br from-gray-100 to-white min-h-screen">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          🍽️ Agregar nuevo menú
        </h2>

        <form onSubmit={handleAgregar} className="space-y-6">
          {/* Nombre */}
          <input
            type="text"
            placeholder="Nombre del plato"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />

          {/* Precio + Precio con IVA */}
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="number"
              placeholder="Precio"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Precio con IVA"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={precioConIVA}
              onChange={(e) => setPrecioConIVA(e.target.value)}
              required
            />
          </div>

          {/* Descuento */}
          <input
            type="number"
            placeholder="Descuento (opcional)"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={descuento}
            onChange={(e) => setDescuento(e.target.value)}
          />

          {/* Adicionales */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <input
              type="text"
              placeholder="Agregar adicional"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={adicional}
              onChange={(e) => setAdicional(e.target.value)}
            />
            <button
              type="button"
              onClick={agregarAdicional}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-xl transition"
            >
              Agregar
            </button>
          </div>

          {/* Lista adicionales */}
          <ul className="list-disc pl-6 text-gray-600 text-sm">
            {adicionales.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>

          {/* Botón submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition"
          >
            {loading ? "Agregando..." : "Agregar menú"}
          </button>

          {/* Mensajes */}
          {success && (
            <p className="text-green-600 text-center font-semibold">
              Menú agregado correctamente.
            </p>
          )}
          {error && (
            <p className="text-red-600 text-center font-semibold">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
}
