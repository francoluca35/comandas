"use client";
import React, { useEffect, useState } from "react";

function StadisticTradeDiaHora() {
  const [data, setData] = useState(null);
  const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/estadisticas/dia-hora");
      const json = await res.json();
      setData(json);
    }
    fetchData();
  }, []);

  if (!data) return <p>Cargando datos...</p>;

  // Formatear datos en matriz días x horas
  const matriz = dias.map((diaNombre, i) => {
    const diaData = data.find((d) => d._id === i + 1);
    const horas = Array(24).fill(0);
    if (diaData) {
      diaData.horas.forEach((h) => {
        horas[h.hora] = h.cantidad;
      });
    }
    return {
      dia: diaNombre,
      horas,
    };
  });

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          minWidth: "700px",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                border: "1px solid #ccc",
                padding: "8px",
                backgroundColor: "#f0f0f0",
                position: "sticky",
                left: 0,
                zIndex: 1,
              }}
            >
              Día / Hora
            </th>
            {[...Array(24).keys()].map((h) => (
              <th
                key={h}
                style={{
                  border: "1px solid #ccc",
                  padding: "8px",
                  backgroundColor: "#f0f0f0",
                  textAlign: "center",
                }}
              >
                {h}:00
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matriz.map(({ dia, horas }) => (
            <tr key={dia}>
              <td
                style={{
                  border: "1px solid #ccc",
                  padding: "8px",
                  backgroundColor: "#fafafa",
                  fontWeight: "bold",
                  position: "sticky",
                  left: 0,
                  zIndex: 1,
                }}
              >
                {dia}
              </td>
              {horas.map((cant, i) => (
                <td
                  key={i}
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    textAlign: "center",
                    backgroundColor: cant
                      ? `rgba(100, 150, 250, ${Math.min(cant / 10, 1)})`
                      : "transparent",
                    color: cant ? "#000" : "#999",
                  }}
                  title={`${cant} clientes`}
                >
                  {cant || "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StadisticTradeDiaHora;
