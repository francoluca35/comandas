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
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          textAlign: "center",
          marginTop: 40,
          color: "#888",
          fontSize: 18,
          letterSpacing: 1,
        }}
      >
        Cargando datos...
      </p>
    );

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

  const maxCount = Math.max(...matriz.flatMap(({ horas }) => horas));

  // Genera un color entre 0 y 1 para el gradiente azul neón
  const neonBlueGradient = (val) => {
    if (!val) return "#121212";
    const intensity = Math.min(val / maxCount, 1);
    const alpha = 0.3 + 0.7 * intensity;
    return `rgba(0, 200, 255, ${alpha})`;
  };

  return (
    <div
      style={{
        fontFamily: "'Poppins', sans-serif",
        color: "#eee",
        padding: "20px",
        backgroundColor: "#121212",
        borderRadius: 15,
        overflowX: "auto",
        boxShadow:
          "0 0 15px rgba(0, 200, 255, 0.5), inset 0 0 10px rgba(0, 200, 255, 0.3)",
      }}
    >
      <table
        style={{
          borderCollapse: "separate",
          borderSpacing: "0 12px",
          width: "100%",
          minWidth: 800,
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                position: "sticky",
                left: 0,
                background: "linear-gradient(90deg, #00c8ff, #0088cc)",
                color: "#fff",
                padding: "14px 20px",
                fontWeight: "800",
                fontSize: 16,
                letterSpacing: 1.5,
                borderRadius: "12px 0 0 12px",
                boxShadow: "0 0 10px #00c8ff",
                zIndex: 3,
              }}
            >
              Día / Hora
            </th>
            {[...Array(24).keys()].map((h) => (
              <th
                key={h}
                style={{
                  padding: "14px 10px",
                  color: "#00c8ff",
                  fontWeight: "600",
                  fontSize: 14,
                  textAlign: "center",
                  userSelect: "none",
                  textShadow: "0 0 4px #00c8ff",
                }}
                title={`${h}:00 horas`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matriz.map(({ dia, horas }) => (
            <tr
              key={dia}
              style={{
                transition: "background-color 0.35s ease",
                cursor: "default",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "rgba(0, 200, 255, 0.1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <td
                style={{
                  position: "sticky",
                  left: 0,
                  background: "linear-gradient(90deg, #00c8ff, #005577)",
                  color: "#fff",
                  fontWeight: "700",
                  padding: "14px 20px",
                  fontSize: 16,
                  letterSpacing: 1,
                  borderRadius: "12px 0 0 12px",
                  boxShadow: "0 0 12px #00c8ff",
                  userSelect: "none",
                  textTransform: "uppercase",
                  textShadow: "0 0 6px #00e0ff",
                }}
              >
                {dia}
              </td>
              {horas.map((cant, i) => (
                <td
                  key={i}
                  style={{
                    textAlign: "center",
                    padding: "14px 10px",
                    backgroundColor: neonBlueGradient(cant),
                    color: cant ? "#000" : "#444",
                    fontWeight: cant ? "700" : "400",
                    borderRadius: 8,
                    boxShadow: cant
                      ? `0 0 8px rgba(0, 200, 255, ${
                          Math.min(cant / maxCount, 1) * 0.9
                        })`
                      : "none",
                    transition: "all 0.3s ease",
                    userSelect: "none",
                    fontSize: 14,
                    letterSpacing: 0.5,
                    cursor: cant ? "pointer" : "default",
                  }}
                  title={`${cant} cliente${cant !== 1 ? "s" : ""}`}
                >
                  {cant || "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <p
        style={{
          marginTop: 18,
          fontSize: 14,
          color: "#00c8ff",
          textAlign: "right",
          fontWeight: "600",
          textShadow: "0 0 6px #00e0ff",
          letterSpacing: 0.8,
        }}
      >
        Más clientes = celda más brillante y neón ✨
      </p>
    </div>
  );
}

export default StadisticTradeDiaHora;
