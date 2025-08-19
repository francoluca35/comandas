"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { entregarPedidoPorId } from "@/utils/entregarPedidoPorId";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import MapaTemporal from "@/app/components/MapaTemporal";

export default function VerMapa() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = searchParams.get("id");
  const [pedido, setPedido] = useState(null);
  const [pedidoEntregado, setPedidoEntregado] = useState(false);
  const [cargandoEntrega, setCargandoEntrega] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`/api/pedidos/${id}`)
        .then((res) => res.json())
        .then((data) => setPedido(data));
    }
  }, [id]);

  const handleEntregar = async () => {
    if (!pedido) return;

    setCargandoEntrega(true);
    try {
      await entregarPedidoPorId(pedido._id);
      setPedidoEntregado(true);

      Swal.fire({
        icon: "success",
        title: "Pedido entregado",
        text: "El pedido ha sido marcado como entregado correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => {
        router.push("/homedelivery");
      }, 2000);
    } catch (error) {
      console.error("Error al entregar pedido:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo marcar el pedido como entregado.",
      });
    } finally {
      setCargandoEntrega(false);
    }
  };

  if (!pedido) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-black to-blue-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando pedido...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-black to-blue-950 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header moderno */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Seguimiento de Pedido
              </h1>
              <p className="text-white/70 text-sm">
                ID: #{pedido._id?.slice(-6)}
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/homedelivery")}
            className="group relative px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/40"
          >
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 transition-transform group-hover:-translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="font-medium">Volver</span>
            </div>
          </button>
        </div>

        {/* Información del pedido - Card moderno */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white">
              Detalles del Pedido
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-white/80 text-sm">Cliente</span>
                <span className="text-white font-medium">{pedido.nombre}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-white/80 text-sm">Dirección</span>
                <span className="text-white font-medium">
                  {pedido.direccion}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-white/80 text-sm">Tipo</span>
                <span className="text-white font-medium">
                  {pedido.tipo === "delivery" ? "Delivery" : "Para llevar"}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-white/80 text-sm">Estado</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    pedido.estado === "en curso"
                      ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                      : pedido.estado === "en camino"
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      : "bg-green-500/20 text-green-300 border border-green-500/30"
                  }`}
                >
                  {pedido.estado}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-white/80 text-sm">Total</span>
                <span className="text-white font-bold text-lg">
                  ${pedido.total}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-white/80 text-sm">Fecha</span>
                <span className="text-white font-medium">
                  {new Date(pedido.fecha).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {pedido.observacion && (
            <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <svg
                  className="w-4 h-4 text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-white/80 text-sm font-medium">
                  Observación
                </span>
              </div>
              <p className="text-white/90 text-sm">{pedido.observacion}</p>
            </div>
          )}

          {pedido.descripcionRepartidor && (
            <div className="mt-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <svg
                  className="w-4 h-4 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="text-white/80 text-sm font-medium">
                  Información para Repartidor
                </span>
              </div>
              <p className="text-white/90 text-sm">
                {pedido.descripcionRepartidor}
              </p>
            </div>
          )}
        </div>

        {/* Mapa temporal - Card moderno */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white">
              Ubicación de Entrega
            </h2>
          </div>
          <MapaTemporal direccion={pedido.direccion} pedido={pedido} />
        </div>

        {/* Botón de entrega - Moderno */}
        {!pedidoEntregado && pedido.estado !== "entregado" && (
          <div className="text-center">
            <button
              onClick={handleEntregar}
              disabled={cargandoEntrega}
              className={`group relative px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                cargandoEntrega
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl"
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                {cargandoEntrega ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Entregando...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Marcar como Entregado</span>
                  </>
                )}
              </div>
            </button>
          </div>
        )}

        {pedidoEntregado && (
          <div className="text-center">
            <div className="bg-green-500/20 border border-green-500/30 text-green-300 px-6 py-4 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center justify-center gap-3 mb-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-semibold text-lg">
                  ¡Pedido entregado exitosamente!
                </span>
              </div>
              <p className="text-sm opacity-90">
                Redirigiendo al panel de delivery...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
