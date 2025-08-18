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
      <div className="flex items-center justify-center h-64 bg-white/5 rounded-xl border border-white/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-3"></div>
          <p className="text-white/70 text-sm">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mapa estático usando OpenStreetMap */}
      <div className="relative h-64 bg-white/5 rounded-xl overflow-hidden border border-white/10 shadow-lg">
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
        {/* Overlay con información de la dirección */}
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm">
          📍 {direccion}
        </div>
      </div>

      {/* Información del pedido - Rediseñado */}
      {pedido && (
        <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="font-semibold text-white text-lg">Resumen del Pedido</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-white/70">Cliente:</span>
              <span className="text-white font-medium">{pedido.nombre}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-white/70">Tipo:</span>
              <span className="text-white font-medium">
                {pedido.tipo === "delivery" ? "Delivery" : "Para llevar"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-white/70">Estado:</span>
              <span className="text-white font-medium">{pedido.estado}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span className="text-white/70">Total:</span>
              <span className="text-white font-bold">${pedido.total}</span>
            </div>
          </div>
          {pedido.observacion && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <span className="text-white/70 text-sm font-medium">Observación</span>
              </div>
              <p className="text-white/90 text-sm">{pedido.observacion}</p>
            </div>
          )}
        </div>
      )}

      {/* Botón para abrir en Google Maps - Rediseñado */}
      <div className="text-center">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            direccion
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <svg className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          Abrir en Google Maps
        </a>
      </div>

      {error && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 px-4 py-3 rounded-xl backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="font-medium">Aviso</span>
          </div>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-1 opacity-80">Se muestra una ubicación aproximada</p>
        </div>
      )}
    </div>
  );
}
