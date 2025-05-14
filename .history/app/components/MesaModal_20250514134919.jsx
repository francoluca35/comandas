"use client";
import { useState } from "react";

export default function MesaModal({ mesa, onClose }) {
  const [usuario, setUsuario] = useState("");
  const [hora, setHora] = useState("");

  const handleGuardar = async () => {
    const res = await fetch(`/api/mesas/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codigo: mesa.codigo,
        usuario,
        hora,
        estado: "ocupada",
      }),
    });

    if (res.ok) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-lg font-bold mb-4">Mesa {mesa.numero}</h2>

        <input
          className="border p-2 w-full mb-2"
          placeholder="Nombre del usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-4"
          placeholder="Hora (HH:MM)"
          value={hora}
          onChange={(e) => setHora(e.target.value)}
        />

        <div className="flex justify-between">
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            className="bg-orange-500 text-white px-4 py-2 rounded"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
