import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

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
      { $group: { _id: "$fecha", totalCobrado: { $sum: "$totalPedido" } } },
    ];

    const pipelineRetiros = [
      {
        $group: {
          _id: { $dateToString: { format: "%d/%m/%Y", date: "$timestamp" } },
          totalRetirado: { $sum: "$montoRetirado" },
        },
      },
    ];

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
    const retiros = await db
      .collection("retiroEfectivo")
      .aggregate(pipelineRetiros)
      .toArray()
      .catch(() => []);

    const resumen = {};

    pedidos.forEach((p) => {
      resumen[p._id] = { fecha: p._id, ingresos: p.totalPedidos, retiros: 0 };
    });

    mesas.forEach((m) => {
      if (!resumen[m._id])
        resumen[m._id] = { fecha: m._id, ingresos: m.totalMesas, retiros: 0 };
      else resumen[m._id].ingresos += m.totalMesas;
    });

    ingresosDiarios.forEach((i) => {
      if (!resumen[i._id])
        resumen[i._id] = { fecha: i._id, ingresos: i.totalCobrado, retiros: 0 };
      else resumen[i._id].ingresos += i.totalCobrado;
    });

    retiros.forEach((r) => {
      if (!resumen[r._id])
        resumen[r._id] = {
          fecha: r._id,
          ingresos: 0,
          retiros: r.totalRetirado,
        };
      else resumen[r._id].retiros = r.totalRetirado;
    });

    const resultado = Object.values(resumen).map((r) => ({
      fecha: r.fecha,
      ingresoTotal: r.ingresos,
      retirosTotal: r.retiros,
      neto: r.ingresos - r.retiros,
    }));

    return NextResponse.json(resultado);
  } catch (err) {
    console.error("Error en informe-diario:", err);
    return NextResponse.json([], { status: 200 });
  }
}
