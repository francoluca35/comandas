"use client";
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

function TopComidas() {
  const chartRef = useRef();

  useEffect(() => {
    fetch("/api/reportes/top-comidas")
      .then((res) => res.json())
      .then((data) => {
        renderBarChart(data);
      });
  }, []);

  function renderBarChart(data) {
    const svg = d3.select(chartRef.current);
    svg.selectAll("*").remove(); // Limpiar antes de volver a renderizar

    const margin = { top: 30, right: 30, bottom: 50, left: 60 },
      width = 500 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    const chart = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d._id))
      .range([0, width])
      .padding(0.2);

    chart
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.total)])
      .range([height, 0]);

    chart.append("g").call(d3.axisLeft(y));

    chart
      .selectAll("bars")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d._id))
      .attr("y", (d) => y(d.total))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.total))
      .attr("fill", "#4f46e5"); // Indigo-600
  }

  return (
    <div className="p-4 border rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Top comidas de lunes a viernes</h2>
      <svg ref={chartRef}></svg>
    </div>
  );
}

export default TopComidas;
