"use client";

import { useState } from "react";
import useAgregarMenu from "@/app/hooks/useAgregarMenu";
import useProductos from "@/app/hooks/useProductos";
import BackArrow from "@/app/components/ui/BackArrow";
import { FiPlusCircle } from "react-icons/fi";
import Swal from "sweetalert2";

export default function AgregarMenu() {
  const { agregarMenu, loading, error, success } = useAgregarMenu();
  const { productos } = useProductos();

  const [modo, setModo] = useState("agregar");
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("comida");

  const [precio, setPrecio] = useState("");
  const [precioConIVA, setPrecioConIVA] = useState("");
  const [descuento, setDescuento] = useState("");
  const [adicional, setAdicional] = useState("");
  const [adicionales, setAdicionales] = useState([]);

  const [modalEditar, setModalEditar] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);

  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 3;
  const totalPaginas = Math.ceil(productos.length / itemsPorPagina);
  const productosPaginados = productos.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  const data = {
    nombre,
    tipo, // 👈 aquí
    precio: parseInt(precio),
    precioConIVA: parseInt(precioConIVA),
    adicionales,
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

  const handleEliminar = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Este menú será eliminado permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      await fetch("/api/menu/eliminar", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      Swal.fire("Eliminado", "El menú ha sido eliminado.", "success");
      location.reload();
    } catch (error) {
      Swal.fire("Error", "Hubo un error al eliminar el menú.", "error");
    }
  };

  const handleEditar = (producto) => {
    setProductoEditar(producto);
    setModalEditar(true);
  };

  const guardarEdicion = async () => {
    const { _id, nombre, precio, precioConIVA, descuento, adicionales } =
      productoEditar;
    try {
      await fetch("/api/menu/editar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: _id,
          nombre,
          precio: parseInt(precio),
          precioConIVA: parseInt(precioConIVA),
          descuento: parseInt(descuento || 0),
          adicionales,
        }),
      });
      Swal.fire(
        "Actualizado",
        "El menú ha sido editado correctamente.",
        "success"
      );
      setModalEditar(false);
      location.reload();
    } catch (err) {
      Swal.fire("Error", "Hubo un error al editar el menú.", "error");
    }
  };

  return (
    <section className="w-full min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-16 px-6">
      <div className="max-w-3xl mx-auto backdrop-blur-lg bg-white/5 rounded-3xl p-10 border border-gray-700 shadow-2xl relative">
        <div className="absolute top-6 left-6">
          <BackArrow label="Volver al panel" />
        </div>

        <h2 className="text-4xl font-bold text-white mb-6 text-center">
          🍽 Gestión de Menú
        </h2>

        <div className="flex justify-center mb-8">
          <div className="bg-white/10 rounded-xl p-1 inline-flex border border-white/20">
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
        <div className="col-span-1 md:col-span-2 mb-2 flex justify-center">
          <div className="bg-white/10 rounded-xl p-1 inline-flex border border-white/20">
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

        {modo === "agregar" ? (
          <form
            onSubmit={handleAgregar}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
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
            <div className="col-span-1 md:col-span-2">
              <input
                type="number"
                placeholder="Descuento (opcional)"
                className="w-full px-5 py-3 rounded-xl bg-white/10 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                value={descuento}
                onChange={(e) => setDescuento(e.target.value)}
              />
            </div>
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
                <FiPlusCircle /> Agregar
              </button>
            </div>
            {adicionales.length > 0 && (
              <div className="col-span-1 md:col-span-2">
                <ul className="list-disc pl-6 text-sm text-cyan-300">
                  {adicionales.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="col-span-1 md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl transition"
              >
                {loading ? "Agregando..." : "Agregar menú"}
              </button>
            </div>
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
        ) : (
          <div className="space-y-4">
            {productosPaginados.map((p) => (
              <div
                key={p._id}
                className="flex justify-between items-center bg-white/10 p-4 rounded-xl border border-white/10 text-white"
              >
                <div>
                  <p className="font-bold">{p.nombre}</p>
                  <p className="text-sm text-cyan-300">
                    Precio: ${p.precio} / IVA: ${p.precioConIVA}
                  </p>
                  {p.descuento && (
                    <p className="text-xs text-yellow-400">
                      Descuento: {p.descuento}
                    </p>
                  )}
                  {p.adicionales?.length > 0 && (
                    <p className="text-xs text-gray-300">
                      Adicionales: {p.adicionales.join(", ")}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditar(p)}
                    className="bg-orange-500 hover:bg-orange-600 text-sm px-3 py-1 rounded-xl"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminar(p._id)}
                    className="bg-red-600 hover:bg-red-700 text-sm px-3 py-1 rounded-xl"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
            <div className="flex justify-center mt-6 gap-2">
              <button
                onClick={() => setPaginaActual(paginaActual - 1)}
                disabled={paginaActual === 1}
                className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white hover:bg-white/20 disabled:opacity-40"
              >
                ← Anterior
              </button>
              <span className="text-white px-3 py-1">
                Página {paginaActual} de {totalPaginas}
              </span>
              <button
                onClick={() => setPaginaActual(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
                className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white hover:bg-white/20 disabled:opacity-40"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
