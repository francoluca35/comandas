"use client";
import { useState } from "react";
import useAgregarMenu from "@/app/hooks/useAgregarMenu";
import { FiPlusCircle } from "react-icons/fi";

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
    <section className="w-full min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-16 px-6">
      <div className="max-w-3xl mx-auto backdrop-blur-lg bg-white/5 rounded-3xl p-10 border border-gray-700 shadow-2xl">
        <h2 className="text-4xl font-bold text-white mb-8 text-center">
          🍽 Agregar Menú
        </h2>

        <form
          onSubmit={handleAgregar}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Nombre */}
          <div className="col-span-1 md:col-span-2">
            <input
              type="text"
              placeholder="Nombre del plato"
              className="w-full px-5 py-3 rounded-xl bg-white/10 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          {/* Precios */}
          <input
            type="number"
            placeholder="Precio"
            className="w-full px-5 py-3 rounded-xl bg-white/10 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Precio con IVA"
            className="w-full px-5 py-3 rounded-xl bg-white/10 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={precioConIVA}
            onChange={(e) => setPrecioConIVA(e.target.value)}
            required
          />

          {/* Descuento */}
          <div className="col-span-1 md:col-span-2">
            <input
              type="number"
              placeholder="Descuento (opcional)"
              className="w-full px-5 py-3 rounded-xl bg-white/10 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={descuento}
              onChange={(e) => setDescuento(e.target.value)}
            />
          </div>

          {/* Adicional + Botón */}
          <div className="flex gap-3 col-span-1 md:col-span-2">
            <input
              type="text"
              placeholder="Adicional"
              className="w-full px-5 py-3 rounded-xl bg-white/10 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={adicional}
              onChange={(e) => setAdicional(e.target.value)}
            />
            <button
              type="button"
              onClick={agregarAdicional}
              className="bg-green-500 hover:bg-green-600 text-white rounded-xl px-4 py-3 flex items-center gap-2"
            >
              <FiPlusCircle />
              Agregar
            </button>
          </div>

          {/* Lista adicionales */}
          {adicionales.length > 0 && (
            <div className="col-span-1 md:col-span-2">
              <ul className="list-disc pl-6 text-sm text-cyan-300">
                {adicionales.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Botón submit */}
          <div className="col-span-1 md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl transition"
            >
              {loading ? "Agregando..." : "Agregar menú"}
            </button>
          </div>

          {/* Mensajes */}
          {success && (
            <p className="col-span-2 text-green-400 text-center font-medium">
              Menú agregado correctamente.
            </p>
          )}
          {error && (
            <p className="col-span-2 text-red-400 text-center font-medium">
              {error}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
