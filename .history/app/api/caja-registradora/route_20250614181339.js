import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");
    const cajaCollection = db.collection("cajaRegistradora");

    let caja = await cajaCollection.findOne();

    if (!caja) {
      // Si no existe la caja, la inicializamos
      await cajaCollection.insertOne({ montoActual: 0 });
      caja = { montoActual: 0 };
    }

    return NextResponse.json(caja);
  } catch (error) {
    console.error("Error al obtener caja:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

// POST para actualizar el monto manualmente
export async function POST(req) {
  try {
    const { monto } = await req.json();

    if (monto == null) {
      return NextResponse.json({ error: "Falta el monto" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("comandas");

    const update = {
      montoActual: parseFloat(monto),
      fechaActualizacion: new Date(),
    };

    await db
      .collection("cajaRegistradora")
      .updateOne({}, { $set: update }, { upsert: true });

    return NextResponse.json({ message: "Monto actualizado correctamente" });
  } catch (err) {
    console.error("Error al actualizar caja:", err);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
