import { connectToDatabase } from "@/lib/mongodb";

export async function GET(req) {
  const { db } = await connectToDatabase();

  const pipelinePedidos = [
    {
      $group: {
        _id: {
          $dateToString: { format: "%d/%m/%Y", date: "$timestamp" },
        },
        totalPedidos: { $sum: "$total" },
      },
    },
  ];

  const pipelineMesas = [
    {
      $group: {
        _id: {
          $dateToString: { format: "%d/%m/%Y", date: "$timestamp" },
        },
        totalMesas: { $sum: "$total" },
      },
    },
  ];

  const pedidos = await db
    .collection("pedidos")
    .aggregate(pipelinePedidos)
    .toArray();
  const mesas = await db
    .collection("tables")
    .aggregate(pipelineMesas)
    .toArray();

  const resumen = {};

  pedidos.forEach((p) => {
    resumen[p._id] = {
      fecha: p._id,
      ingresosPedidos: p.totalPedidos,
      ingresosMesas: 0,
    };
  });

  mesas.forEach((m) => {
    if (!resumen[m._id]) {
      resumen[m._id] = {
        fecha: m._id,
        ingresosPedidos: 0,
        ingresosMesas: m.totalMesas,
      };
    } else {
      resumen[m._id].ingresosMesas = m.totalMesas;
    }
  });

  const resultado = Object.values(resumen).map((r) => ({
    fecha: r.fecha,
    ingreso: r.ingresosPedidos + r.ingresosMesas,
  }));

  return Response.json(resultado, { status: 200 });
}
