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

  if (!comidas) return <p>Cargando top comidas...</p>;

  return (
    <div style={{ maxWidth: 600, marginTop: 24 }}>
      <h2 style={{ marginBottom: 12 }}>Top 10 comidas (Lunes a Viernes)</h2>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "left",
        }}
      >
        <thead>
          <tr>
            <th style={{ borderBottom: "2px solid #ccc", padding: 8 }}>
              Comida
            </th>
            <th
              style={{
                borderBottom: "2px solid #ccc",
                padding: 8,
                textAlign: "right",
              }}
            >
              Cantidad
            </th>
          </tr>
        </thead>
        <tbody>
          {comidas.map(({ _id, cantidad }) => (
            <tr key={_id}>
              <td
                style={{
                  borderBottom: "1px solid #eee",
                  padding: 8,
                }}
              >
                {_id}
              </td>
              <td
                style={{
                  borderBottom: "1px solid #eee",
                  padding: 8,
                  textAlign: "right",
                  fontWeight: "bold",
                }}
              >
                {cantidad}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TopComidas;
