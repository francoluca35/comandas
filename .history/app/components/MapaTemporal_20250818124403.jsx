"use client";

import { useState, useEffect } from "react";

export default function MapaTemporal({ direccion, pedido }) {
  const [coordenadas, setCoordenadas] = useState(null);
  const [error, setError] = useState(null);

  // Coordenadas aproximadas de Buenos Aires como fallback
  const coordenadasDefault = { lat: -34.6037, lng: -58.3816 };

  useEffect(() => {
    if (direccion) {
      // Intentar obtener coordenadas usando un servicio gratuito
      const obtenerCoordenadas = async () => {
        try {
          // Usar OpenStreetMap Nominatim (gratuito)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              direccion + ", Buenos Aires, Argentina"
            )}`
          );
          const data = await response.json();

          if (data && data.length > 0) {
            setCoordenadas({
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon),
            });
          } else {
            setCoordenadas(coordenadasDefault);
            setError("No se pudo obtener la ubicación exacta");
          }
        } catch (err) {
          console.error("Error al obtener coordenadas:", err);
          setCoordenadas(coordenadasDefault);
          setError("Error al cargar el mapa");
        }
      };

      obtenerCoordenadas();
    }
  }, [direccion]);

  if (!coordenadas) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-200 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mapa estático usando OpenStreetMap */}
      <div className="relative h-64 bg-gray-200 rounded-lg overflow-hidden">
        <iframe
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${
            coordenadas.lng - 0.01
          },${coordenadas.lat - 0.01},${coordenadas.lng + 0.01},${
            coordenadas.lat + 0.01
          }&layer=mapnik&marker=${coordenadas.lat},${coordenadas.lng}`}
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
          title="Mapa de ubicación"
        />
      </div>

      {/* Información del pedido */}
      {pedido && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-2">Información del Pedido</h3>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Cliente:</strong> {pedido.nombre}
            </p>
            <p>
              <strong>Dirección:</strong> {pedido.direccion}
            </p>
            <p>
              <strong>Tipo:</strong>{" "}
              {pedido.tipo === "delivery" ? "Delivery" : "Para llevar"}
            </p>
            <p>
              <strong>Estado:</strong> {pedido.estado}
            </p>
            <p>
              <strong>Total:</strong> ${pedido.total}
            </p>
            {pedido.observacion && (
              <p>
                <strong>Observación:</strong> {pedido.observacion}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Botón para abrir en Google Maps */}
      <div className="text-center">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            direccion
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          Abrir en Google Maps
        </a>
      </div>

      {error && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-1">Se muestra una ubicación aproximada</p>
        </div>
      )}
    </div>
  );
}
