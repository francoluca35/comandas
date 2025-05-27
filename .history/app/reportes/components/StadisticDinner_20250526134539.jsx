"use client";
import React, { useEffect, useState } from "react";

function StadisticDinner() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/estadisticas/dinner");
      const json = await res.json();
      setData(json);
    }
    fetchData();
  }, []);

  if (!data) return <p>Cargando estadísticas...</p>;

  const formatCurrency = (n) =>
    n.toLocaleString("es-AR", { style: "currency", currency: "ARS" });

  const totalDia = data.porDia?.[0]?.total || 0;
  const totalSemana = data.porSemana?.[0]?.total || 0;
  const totalMes = data.porMes?.[0]?.total || 0;

  return (
    <div className="grid gap-4 md:grid-cols-3 p-4 bg-white shadow rounded-xl">
      <div className="p-4 bg-blue-100 rounded-lg">
        <h3 className="text-sm text-blue-800">Hoy</h3>
        <p className="text-xl font-bold text-blue-900">
          {formatCurrency(totalDia)}
        </p>
      </div>
      <div className="p-4 bg-green-100 rounded-lg">
        <h3 className="text-sm text-green-800">Esta Semana</h3>
        <p className="text-xl font-bold text-green-900">
          {formatCurrency(totalSemana)}
        </p>
      </div>
      <div className="p-4 bg-yellow-100 rounded-lg">
        <h3 className="text-sm text-yellow-800">Este Mes</h3>
        <p className="text-xl font-bold text-yellow-900">
          {formatCurrency(totalMes)}
        </p>
      </div>
    </div>
  );
}

export default StadisticDinner;
