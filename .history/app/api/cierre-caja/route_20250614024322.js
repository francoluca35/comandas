import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    const hoy = new Date();
    const inicioDia = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate()
    );
    const finDia = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate() + 1
    );

    // Ingresos del día (sumamos totalPedido de ingresosDiarios)
    const ingresos = await db
      .collection("ingresosDiarios")
      .aggregate([
        { $match: { timestamp: { $gte: inicioDia, $lt: finDia } } },
        { $group: { _id: null, total: { $sum: "$totalPedido" } } },
      ])
      .toArray();
    const totalIngresos = ingresos[0]?.total || 0;

    // Retiros del día
    const retiros = await db
      .collection("retiroEfectivo")
      .aggregate([
        { $match: { timestamp: { $gte: inicioDia, $lt: finDia } } },
        { $group: { _id: null, total: { $sum: "$montoRetirado" } } },
      ])
      .toArray();
    const totalRetiros = retiros[0]?.total || 0;

    const neto = totalIngresos - totalRetiros;

    // Saldo actual de caja en el momento del cierre
    const caja = await db.collection("cajaRegistradora").findOne({});
    const saldoEnCaja = caja?.montoActual || 0;

    // Guardar el cierre en nueva colección cierresCaja
    await db.collection("cierresCaja").insertOne({
      fechaCierre: hoy.toLocaleDateString("es-AR"),
      horaCierre: hoy.toLocaleTimeString("es-AR"),
      totalIngresos,
      totalRetiros,
      neto,
      saldoEnCaja,
      timestamp: new Date(),
    });

    return NextResponse.json({
      message: "Cierre realizado correctamente",
      cierre: { totalIngresos, totalRetiros, neto, saldoEnCaja },
    });
  } catch (err) {
    console.error("Error al realizar cierre:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    const cierres = await db
      .collection("cierresCaja")
      .find({})
      .sort({ timestamp: -1 })
      .toArray();
    return NextResponse.json(cierres);
  } catch (err) {
    console.error("Error al obtener cierres:", err);
    return NextResponse.json([], { status: 200 });
  }
}
