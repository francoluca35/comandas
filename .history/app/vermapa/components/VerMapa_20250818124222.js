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
        router.push("/delivery");
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
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-black to-blue-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">
            Seguimiento de Pedido
          </h1>
          <button
            onClick={() => router.push("/delivery")}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Volver
          </button>
        </div>

        {/* Información del pedido */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Detalles del Pedido</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Cliente:</strong> {pedido.nombre}</p>
              <p><strong>Dirección:</strong> {pedido.direccion}</p>
              <p><strong>Tipo:</strong> {pedido.tipo === "delivery" ? "Delivery" : "Para llevar"}</p>
            </div>
            <div>
              <p><strong>Estado:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  pedido.estado === "en curso" ? "bg-yellow-100 text-yellow-800" :
                  pedido.estado === "en camino" ? "bg-blue-100 text-blue-800" :
                  "bg-green-100 text-green-800"
                }`}>
                  {pedido.estado}
                </span>
              </p>
              <p><strong>Total:</strong> ${pedido.total}</p>
              <p><strong>Fecha:</strong> {new Date(pedido.fecha).toLocaleString()}</p>
            </div>
          </div>
          {pedido.observacion && (
            <div className="mt-4">
              <p><strong>Observación:</strong> {pedido.observacion}</p>
            </div>
          )}
        </div>

        {/* Mapa temporal */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Ubicación de Entrega</h2>
          <MapaTemporal direccion={pedido.direccion} pedido={pedido} />
        </div>

        {/* Botón de entrega */}
        {!pedidoEntregado && pedido.estado !== "entregado" && (
          <div className="text-center">
            <button
              onClick={handleEntregar}
              disabled={cargandoEntrega}
              className={`px-8 py-3 rounded-lg text-white font-semibold transition-colors ${
                cargandoEntrega 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {cargandoEntrega ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Entregando...
                </div>
              ) : (
                "Marcar como Entregado"
              )}
            </button>
          </div>
        )}

        {pedidoEntregado && (
          <div className="text-center">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <p className="font-semibold">¡Pedido entregado exitosamente!</p>
              <p className="text-sm">Redirigiendo al panel de delivery...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
