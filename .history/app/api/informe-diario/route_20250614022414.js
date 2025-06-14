import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    // Pipelines
    const pipelinePedidos = [
      {
        $group: {
          _id: { $dateToString: { format: "%d/%m/%Y", date: "$timestamp" } },
          totalPedidos: { $sum: "$total" },
        },
      },
    ];

    const pipelineMesas = [
      {
        $group: {
          _id: { $dateToString: { format: "%d/%m/%Y", date: "$timestamp" } },
          totalMesas: { $sum: "$total" },
        },
      },
    ];

    const pipelineIngresosDiarios = [
      {
        $group: {
          _id: { $dateToString: { format: "%d/%m/%Y", date: "$timestamp" } },
          totalCobrado: { $sum: "$montoIngresado" },
        },
      },
    ];

    // Consultas con fallback
    const pedidos = await db
      .collection("pedidos")
      .aggregate(pipelinePedidos)
      .toArray()
      .catch(() => []);
    const mesas = await db
      .collection("tables")
      .aggregate(pipelineMesas)
      .toArray()
      .catch(() => []);
    const ingresosDiarios = await db
      .collection("ingresosDiarios")
      .aggregate(pipelineIngresosDiarios)
      .toArray()
      .catch(() => []);

    const resumen = {};

    pedidos.forEach((p) => {
      resumen[p._id] = {
        fecha: p._id,
        pedidos: p.totalPedidos,
        mesas: 0,
        cobros: 0,
      };
    });

    mesas.forEach((m) => {
      if (!resumen[m._id]) {
        resumen[m._id] = {
          fecha: m._id,
          pedidos: 0,
          mesas: m.totalMesas,
          cobros: 0,
        };
      } else {
        resumen[m._id].mesas = m.totalMesas;
      }
    });

    ingresosDiarios.forEach((i) => {
      if (!resumen[i._id]) {
        resumen[i._id] = {
          fecha: i._id,
          pedidos: 0,
          mesas: 0,
          cobros: i.totalCobrado,
        };
      } else {
        resumen[i._id].cobros = i.totalCobrado;
      }
    });

    const resultado = Object.values(resumen).map((r) => ({
      fecha: r.fecha,
      ingresoTotal: r.pedidos + r.mesas + r.cobros,
    }));

    return NextResponse.json(resultado);
  } catch (err) {
    console.error("Error en informe-diario:", err);
    return NextResponse.json([], { status: 200 }); // <- devolvemos un array vacío para no romper el front
  }
}
