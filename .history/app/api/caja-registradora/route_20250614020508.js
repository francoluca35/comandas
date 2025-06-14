import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

// Obtener monto actual
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    const caja = await db.collection("cajaRegistradora").findOne({});
    if (!caja) {
      return NextResponse.json({ montoActual: 0 });
    }

    return NextResponse.json({
      montoActual: caja.montoActual,
      fechaActualizacion: caja.fechaActualizacion,
    });
  } catch (err) {
    console.error("Error al obtener caja:", err);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

// Actualizar monto
export async function POST(req) {
  try {
    const { montoRetirado } = await req.json();

    if (!montoRetirado || montoRetirado <= 0) {
      return NextResponse.json({ error: "Monto inválido" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("comandas");

    const caja = await db.collection("cajaRegistradora").findOne({});
    if (!caja) {
      return NextResponse.json(
        { error: "Caja no inicializada" },
        { status: 400 }
      );
    }

    const antiguoMonto = caja.montoActual;
    const montoActualizado = antiguoMonto - parseFloat(montoRetirado);

    // Guardamos el historial
    await db.collection("retiroEfectivo").insertOne({
      fecha: new Date().toLocaleDateString("es-AR"),
      hora: new Date().toLocaleTimeString("es-AR"),
      antiguoMonto,
      montoRetirado: parseFloat(montoRetirado),
      montoActualizado,
      timestamp: new Date(),
    });

    // Actualizamos la caja
    await db.collection("cajaRegistradora").updateOne(
      {},
      {
        $set: {
          montoActual: montoActualizado,
          fechaActualizacion: new Date(),
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error al realizar retiro:", err);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
