import React, { useState } from "react";
import Image from "next/image";
import BackArrow from "@/app/components/ui/BackArrow";

function CajaRetiro() {
  const [dineroCaja, setDineroCaja] = useState(10000000); // Simulado
  const [retiro, setRetiro] = useState("");

  const handleRetiro = () => {
    if (!retiro || isNaN(retiro)) return;
    const nuevoMonto = dineroCaja - parseFloat(retiro);
    setDineroCaja(nuevoMonto);
    setRetiro("");
    alert("Retiro realizado correctamente");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-black to-blue-950">
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BackArrow />
          <div className="flex items-center gap-3">
            <Image
              src="/Assets/Mesas/logo-peru-mar.png"
              alt="Logo"
              width={40}
              height={40}
              className="rounded-full border border-white shadow-sm"
            />
            <h1 className="text-white text-2xl font-bold tracking-tight">
              PeruMar<span className="text-blue-400">.</span>
            </h1>
          </div>
        </div>
      </header>

      {/* Cuerpo */}
      <div className="flex flex-col items-center justify-center mt-10 px-4">
        <h2 className="text-white text-3xl font-semibold mb-10">
          Historial & Retiro
        </h2>

        <div className="bg-black/50 p-6 rounded-xl flex flex-col md:flex-row gap-10">
          {/* Informe semanal */}
          <div className="bg-white/10 p-4 rounded-lg border border-blue-400 w-[300px]">
            <h3 className="text-white text-xl text-center mb-4">
              Informe Semanal
            </h3>
            <table className="w-full text-center text-white">
              <thead>
                <tr className="border-b border-white">
                  <th>Fecha</th>
                  <th>Ingreso</th>
                  <th>Retiro</th>
                </tr>
              </thead>
              <tbody>
                {/* Simulamos los datos */}
                {[1, 2, 3, 4].map((_, index) => (
                  <tr key={index} className="border-b border-white">
                    <td>14/06</td>
                    <td>$12000</td>
                    <td>$10000</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-center mt-2 text-blue-300 font-semibold hover:underline cursor-pointer">
              Ver más
            </div>
          </div>

          {/* Retiro de caja */}
          <div className="bg-white/10 p-6 rounded-lg w-[300px]">
            <h3 className="text-white text-xl text-center mb-4">
              Dinero en caja
            </h3>

            <div className="bg-gray-300 rounded-full text-center py-3 text-black font-bold mb-6">
              ${dineroCaja.toLocaleString()}
            </div>

            <label className="text-white mb-2 block">Retiro</label>
            <input
              type="number"
              placeholder="Ingrese monto a retirar"
              value={retiro}
              onChange={(e) => setRetiro(e.target.value)}
              className="w-full px-4 py-2 mb-4 rounded bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <button
              onClick={handleRetiro}
              className="w-full bg-white text-black font-semibold py-2 rounded-lg hover:bg-gray-300 transition-all"
            >
              Retirar Efectivo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CajaRetiro;
