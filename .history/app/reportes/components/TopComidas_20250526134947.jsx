"use client";
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Card } from "@/components/ui/card";

function TopComidas() {
  const chartRef = useRef();

  useEffect(() => {
    fetch("/api/top-comidas")
      .then((res) => res.json())
      .then((data) => {
        drawChart(data);
      });
  }, []);

  const drawChart = (data) => {
    d3.select(chartRef.current).selectAll("*").remove();

    const margin = { top: 40, right: 20, bottom: 40, left: 100 };
    const width = 400;
    const height = data.length * 40;

    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr(
        "viewBox",
        `0 0 ${width + margin.left + margin.right} ${
          height + margin.top + margin.bottom
        }`
      )
      .attr("preserveAspectRatio", "xMidYMid meet");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.cantidad)])
      .range([0, width]);
    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.comida))
      .range([0, height])
      .padding(0.3);

    g.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("y", (d) => y(d.comida))
      .attr("width", (d) => x(d.cantidad))
      .attr("height", y.bandwidth())
      .attr("fill", "#4ade80"); // verde

    g.selectAll("text")
      .data(data)
      .enter()
      .append("text")
      .attr("x", (d) => x(d.cantidad) + 5)
      .attr("y", (d) => y(d.comida) + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      .text((d) => d.cantidad)
      .attr("fill", "#000");

    g.append("g")
      .call(d3.axisLeft(y).tickSize(0))
      .selectAll("text")
      .attr("font-size", "14px");
  };

  return (
    <Card className="p-4 w-full">
      <h2 className="text-xl font-bold mb-4">Top comidas (lunes a viernes)</h2>
      <div ref={chartRef} className="w-full" />
    </Card>
  );
}

export default TopComidas;
