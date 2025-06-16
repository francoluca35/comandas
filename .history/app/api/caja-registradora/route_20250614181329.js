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
