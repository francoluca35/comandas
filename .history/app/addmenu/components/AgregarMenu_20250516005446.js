"use client";
import { useState } from "react";
import useAgregarMenu from "../hooks/useAgregarMenu";

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
    <div className="p-4 max-w-xl mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Agregar nuevo menú</h2>
      <form onSubmit={handleAgregar} className="space-y-4">
        <input
          type="text"
          placeholder="Nombre del plato"
          className="w-full p-2 border"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Precio"
            className="w-1/2 p-2 border"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Precio con IVA"
            className="w-1/2 p-2 border"
            value={precioConIVA}
            onChange={(e) => setPrecioConIVA(e.target.value)}
            required
          />
        </div>

        <input
          type="number"
          placeholder="Descuento (opcional)"
          className="w-full p-2 border"
          value={descuento}
          onChange={(e) => setDescuento(e.target.value)}
        />

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Adicional"
            className="w-full p-2 border"
            value={adicional}
            onChange={(e) => setAdicional(e.target.value)}
          />
          <button
            type="button"
            onClick={agregarAdicional}
            className="bg-green-600 text-white px-3 rounded"
          >
            Agregar
          </button>
        </div>

        <ul className="list-disc pl-5 text-sm text-gray-600">
          {adicionales.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          {loading ? "Agregando..." : "Agregar menú"}
        </button>

        {success && (
          <p className="text-green-600">Menú agregado correctamente.</p>
        )}
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  );
}
