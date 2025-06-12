import { NextResponse } from "next/server";

import { ObjectId } from "mongodb"; // ⚠️ IMPORTANTE

export async function PUT(req) {
    const { default: clientPromise } = await import('@/lib/mongodb');
  try {
    const { id, nuevoEstado } = await req.json();

    const client = await clientPromise;
    const db = client.db("comandas");

    await db.collection("pedidos").updateOne(
      { _id: new ObjectId(id) }, // ⚠️ asegurate de convertir el ID
      { $set: { estado: nuevoEstado } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en PUT /api/maps/estado:", error);
    return NextResponse.json(
      { error: "Error al actualizar el estado" },
      { status: 500 }
    );
  }
}