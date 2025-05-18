"use client";

import { useState } from "react";
import useAgregarMenu from "@/app/hooks/useAgregarMenu";
import useProductos from "@/app/hooks/useProductos";
import BackArrow from "@/app/components/ui/BackArrow";
import { FiPlusCircle, FiX } from "react-icons/fi";
import Swal from "sweetalert2";

export default function AgregarMenu() {
  const { agregarMenu, loading } = useAgregarMenu();
  const { productos } = useProductos();

  const [modo, setModo] = useState("agregar");
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("comida");
  const [precio, setPrecio] = useState("");
  const [precioConIVA, setPrecioConIVA] = useState("");
  const [descuento, setDescuento] = useState("");
  const [adicional, setAdicional] = useState("");
  const [adicionales, setAdicionales] = useState([]);
  const [productoEditar, setProductoEditar] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [filtroTipo, setFiltroTipo] = useState("todos");

  const itemsPorPagina = 3;
  const productosFiltrados = productos.filter((p) =>
    filtroTipo === "todos" ? true : p.tipo === filtroTipo
  );
  const productosPaginados = productosFiltrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );
  const totalPaginas = Math.ceil(productosFiltrados.length / itemsPorPagina);

  const handleAgregar = async (e) => {
    e.preventDefault();
    const data = {
      nombre,
      tipo,
      precio: parseInt(precio),
      precioConIVA: parseInt(precioConIVA),
      adicionales: tipo === "comida" ? adicionales : [],
      ...(descuento && { descuento: parseInt(descuento) }),
    };
    await agregarMenu(data);
    Swal.fire("Agregado", "Menú agregado correctamente.", "success");
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
    <section className="w-full min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-16 px-4">
      <div className="max-w-3xl mx-auto backdrop-blur-lg bg-white/5 rounded-3xl p-6 md:p-10 border border-gray-700 shadow-2xl relative overflow-hidden">
        <div className="absolute top-4 left-4">
          <BackArrow label="Volver al panel" />
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">
          🍽 Gestión de Menú
        </h2>

        <div className="flex justify-center mb-8">
          <div className="bg-white/10 rounded-xl p-1 flex flex-wrap justify-center gap-2 w-full md:w-auto border border-white/20">
            <button
              onClick={() => setModo("agregar")}
              className={`px-4 py-2 rounded-xl transition ${
                modo === "agregar"
                  ? "bg-cyan-600 text-white font-bold"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Agregar Menú
            </button>
            <button
              onClick={() => setModo("editar")}
              className={`px-4 py-2 rounded-xl transition ${
                modo === "editar"
                  ? "bg-cyan-600 text-white font-bold"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Editar / Eliminar
            </button>
          </div>
        </div>

        {modo === "agregar" ? (
          <form
            onSubmit={handleAgregar}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6"
          >
            <div className="sm:col-span-2 flex justify-center">
              <div className="bg-white/10 rounded-xl p-1 flex flex-wrap justify-center gap-2 w-full sm:w-auto border border-white/20">
                <button
                  type="button"
                  onClick={() => setTipo("comida")}
                  className={`px-4 py-2 rounded-xl transition ${
                    tipo === "comida"
                      ? "bg-orange-500 text-white font-bold"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  🍽 Comida
                </button>
                <button
                  type="button"
                  onClick={() => setTipo("bebida")}
                  className={`px-4 py-2 rounded-xl transition ${
                    tipo === "bebida"
                      ? "bg-blue-500 text-white font-bold"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  🥤 Bebida
                </button>
              </div>
            </div>

            <input
              type="text"
              placeholder={`Nombre del ${
                tipo === "bebida" ? "bebida" : "plato"
              }`}
              className="w-full px-5 py-3 rounded-xl bg-white/10 text-white border border-gray-600"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Precio"
              className="w-full px-5 py-3 rounded-xl bg-white/10 text-white border border-gray-600"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Precio con IVA"
              className="w-full px-5 py-3 rounded-xl bg-white/10 text-white border border-gray-600"
              value={precioConIVA}
              onChange={(e) => setPrecioConIVA(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Descuento (opcional)"
              className="w-full px-5 py-3 rounded-xl bg-white/10 text-white border border-gray-600"
              value={descuento}
              onChange={(e) => setDescuento(e.target.value)}
            />

            {tipo === "comida" && (
              <>
                <div className="flex gap-3 sm:col-span-2 flex-col sm:flex-row">
                  <input
                    type="text"
                    placeholder="Adicional"
                    className="w-full px-5 py-3 rounded-xl bg-white/10 text-white border border-gray-600"
                    value={adicional}
                    onChange={(e) => setAdicional(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={agregarAdicional}
                    className="bg-green-500 hover:bg-green-600 text-white rounded-xl px-4 py-3 flex items-center gap-2 justify-center"
                  >
                    <FiPlusCircle /> Agregar
                  </button>
                </div>

                {adicionales.length > 0 && (
                  <div className="sm:col-span-2">
                    <ul className="list-disc pl-6 text-sm text-cyan-300">
                      {adicionales.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl"
              >
                {loading ? "Agregando..." : "Agregar menú"}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-white text-center">
            Editar / Eliminar menú (sección omitida aquí)
          </p>
        )}
      </div>
    </section>
  );
}
