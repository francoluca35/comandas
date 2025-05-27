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
          marginTop: 20,
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

  // Función para obtener color según la cantidad, usando escala de azul
  const getColor = (count) => {
    if (!count) return "#f5f7fa";
    // max 15 clientes para color full
    const opacity = Math.min(count / 15, 1);
    return `rgba(30, 144, 255, ${opacity})`; // DodgerBlue
  };

  return (
    <div
      style={{
        overflowX: "auto",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        marginTop: 20,
        padding: "0 10px",
      }}
    >
      <table
        style={{
          borderCollapse: "separate",
          borderSpacing: "0 6px",
          width: "100%",
          minWidth: 750,
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          borderRadius: 10,
          backgroundColor: "#fff",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                position: "sticky",
                left: 0,
                backgroundColor: "#1e90ff",
                color: "#fff",
                padding: "12px 16px",
                borderTopLeftRadius: 10,
                borderBottomLeftRadius: 10,
                fontWeight: "700",
                fontSize: 14,
                textAlign: "left",
                zIndex: 2,
                boxShadow: "2px 0 5px -2px rgba(0,0,0,0.15)",
              }}
            >
              Día / Hora
            </th>
            {[...Array(24).keys()].map((h) => (
              <th
                key={h}
                style={{
                  padding: "12px 10px",
                  backgroundColor: "#f0f8ff",
                  color: "#333",
                  fontWeight: "600",
                  fontSize: 12,
                  textAlign: "center",
                  userSelect: "none",
                }}
                title={`${h}:00 horas`}
              >
                {h}:00
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matriz.map(({ dia, horas }) => (
            <tr
              key={dia}
              style={{
                transition: "background-color 0.3s ease",
                cursor: "default",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f5faff")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <td
                style={{
                  position: "sticky",
                  left: 0,
                  backgroundColor: "#1e90ff",
                  color: "#fff",
                  fontWeight: "700",
                  padding: "12px 16px",
                  fontSize: 14,
                  boxShadow: "2px 0 5px -2px rgba(0,0,0,0.15)",
                  borderTopLeftRadius: 10,
                  borderBottomLeftRadius: 10,
                  userSelect: "none",
                }}
              >
                {dia}
              </td>
              {horas.map((cant, i) => (
                <td
                  key={i}
                  style={{
                    textAlign: "center",
                    padding: "12px 8px",
                    backgroundColor: getColor(cant),
                    color: cant ? "#fff" : "#bbb",
                    fontWeight: cant ? "600" : "400",
                    borderRadius: 6,
                    transition: "background-color 0.3s ease",
                    userSelect: "none",
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
          marginTop: 12,
          fontSize: 12,
          color: "#555",
          fontStyle: "italic",
        }}
      >
        Los colores más intensos indican mayor cantidad de clientes.
      </p>
    </div>
  );
}

export default StadisticTradeDiaHora;
