"use client";
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function TopComidas() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/api/top-comidas")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error("Error cargando datos:", err));
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 w-full">
      <h2 className="text-xl font-bold mb-4">Top comidas de lunes a viernes</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="nombre" type="category" />
          <Tooltip />
          <Bar dataKey="cantidad" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TopComidas;
