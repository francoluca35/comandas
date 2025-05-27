"use client";
import React, { useEffect, useState } from "react";

function TopComidas() {
  const [comidas, setComidas] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/estadisticas/top-comidas");
      const json = await res.json();
      setComidas(json);
    }
    fetchData();
  }, []);

  if (!comidas)
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
        Cargando top comidas...
      </p>
    );

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        backgroundColor: "#181818",
        padding: 20,
        borderRadius: 12,
        maxWidth: 600,
        width: "100%",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        marginTop: 32,
      }}
    >
      <h2
        style={{
          color: "#e0e0e0",
          fontSize: 20,
          fontWeight: "600",
          marginBottom: 16,
        }}
      >
        🍽️ Top 10 comidas (Lunes a Viernes)
      </h2>
      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: "0 8px",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                textAlign: "left",
                padding: "10px 12px",
                backgroundColor: "#2a2a2a",
                color: "#ccc",
                borderRadius: "8px 0 0 8px",
              }}
            >
              Comida
            </th>
            <th
              style={{
                textAlign: "right",
                padding: "10px 12px",
                backgroundColor: "#2a2a2a",
                color: "#ccc",
                borderRadius: "0 8px 8px 0",
              }}
            >
              Cantidad
            </th>
          </tr>
        </thead>
        <tbody>
          {comidas.map(({ _id, cantidad }, index) => {
            const bgColor = `rgba(100, 180, 250, ${
              0.15 + (0.5 * (10 - index)) / 10
            })`; // barra sutilmente degradada
            return (
              <tr key={_id}>
                <td
                  style={{
                    backgroundColor: "#222",
                    padding: "10px 12px",
                    color: "#eee",
                    fontWeight: 500,
                    borderRadius: "8px 0 0 8px",
                  }}
                >
                  {_id}
                </td>
                <td
                  style={{
                    backgroundColor: bgColor,
                    padding: "10px 12px",
                    color: "#111",
                    fontWeight: "600",
                    textAlign: "right",
                    borderRadius: "0 8px 8px 0",
                  }}
                >
                  {cantidad}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TopComidas;
