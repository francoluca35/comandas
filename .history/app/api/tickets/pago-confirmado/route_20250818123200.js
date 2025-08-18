import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { mesa, total, metodoPago } = await req.json();

    if (!mesa || !total || !metodoPago) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("comandas");

    // COBRO AUTOMÁTICO: Solo se cobra cuando se confirma el pago
    if (metodoPago.toLowerCase() === "efectivo") {
      // Registrar ingreso diario
      await db.collection("ingresosDiarios").insertOne({
        totalPedido: parseFloat(total),
        timestamp: new Date(),
      });

      // Sumar a la caja registradora
      await db.collection("cajaRegistradora").updateOne(
        {},
        {
          $inc: { montoActual: parseFloat(total) },
          $set: { fechaActualizacion: new Date() },
        },
        { upsert: true }
      );

      console.log(`✅ Cobro registrado: $${total} - Mesa: ${mesa}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al confirmar pago:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
