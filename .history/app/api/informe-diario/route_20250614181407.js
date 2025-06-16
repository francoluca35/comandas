import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    const pedidos = await db
      .collection("pedidos")
      .find({ formaDePago: "efectivo" })
      .toArray();
    const retiros = await db.collection("retiroEfectivo").find().toArray();

    // agrupamos por fecha
    const resumen = {};

    pedidos.forEach((p) => {
      const fecha = p.fecha.split(",")[0];
      if (!resumen[fecha]) resumen[fecha] = { ingresos: 0, retiros: 0 };
      resumen[fecha].ingresos += p.total;
    });

    retiros.forEach((r) => {
      const fecha = r.fecha;
      if (!resumen[fecha]) resumen[fecha] = { ingresos: 0, retiros: 0 };
      resumen[fecha].retiros += r.monto;
    });

    const resultado = Object.entries(resumen).map(([fecha, datos]) => ({
      fecha,
      ingresos: datos.ingresos,
      retiros: datos.retiros,
      neto: datos.ingresos - datos.retiros,
    }));

    return NextResponse.json(
      resultado.sort((a, b) => b.fecha.localeCompare(a.fecha))
    );
  } catch (error) {
    console.error("Error informe diario:", error);
    return NextResponse.json({ error: "Error servidor" }, { status: 500 });
  }
}
