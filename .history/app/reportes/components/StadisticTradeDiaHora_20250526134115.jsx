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

  if (!data)
    return (
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          textAlign: "center",
          marginTop: 40,
          color: "#aaa",
          fontSize: 16,
        }}
      >
        Cargando datos...
      </p>
    );

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

  const maxCount = Math.max(...matriz.flatMap((d) => d.horas));

  const getCellColor = (val) => {
    if (!val) return "#1f1f1f";
    const opacity = Math.min(val / maxCount, 1) * 0.6 + 0.2;
    return `rgba(100, 180, 250, ${opacity})`; // azul suave
  };

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        backgroundColor: "#181818",
        padding: 20,
        borderRadius: 12,
        overflowX: "auto",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      }}
      className="mt-4"
    >
      <h2
        style={{
          color: "#e0e0e0",
          fontSize: 20,
          fontWeight: "600",
          marginBottom: 16,
        }}
        className="text-center"
      >
        Clientes por día y hora
      </h2>
      <table
        style={{
          borderCollapse: "separate",
          borderSpacing: "0 8px",
          width: "100%",
          minWidth: 800,
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                textAlign: "left",
                padding: "12px 16px",
                backgroundColor: "#2a2a2a",
                color: "#ccc",
                borderRadius: "8px 0 0 8px",
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
                  textAlign: "center",
                  padding: "12px 8px",
                  backgroundColor: "#2a2a2a",
                  color: "#aaa",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matriz.map(({ dia, horas }) => (
            <tr key={dia}>
              <td
                style={{
                  backgroundColor: "#222",
                  color: "#ddd",
                  padding: "10px 16px",
                  fontWeight: 500,
                  borderRadius: "8px 0 0 8px",
                  position: "sticky",
                  left: 0,
                }}
              >
                {dia}
              </td>
              {horas.map((cant, i) => (
                <td
                  key={i}
                  style={{
                    backgroundColor: getCellColor(cant),
                    padding: "10px 8px",
                    textAlign: "center",
                    borderRadius: 6,
                    color: cant ? "#111" : "#666",
                    fontWeight: cant ? 600 : 400,
                    fontSize: 13,
                    transition: "background 0.3s",
                    userSelect: "none",
                  }}
                  title={`${cant || 0} cliente${cant === 1 ? "" : "s"}`}
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
