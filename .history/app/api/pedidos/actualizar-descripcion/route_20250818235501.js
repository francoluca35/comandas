import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PUT(req) {
  try {
    const { id, descripcionRepartidor } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Falta el ID del pedido" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("comandas");
    const pedidosCollection = db.collection("pedidos");

    await pedidosCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          descripcionRepartidor: descripcionRepartidor || "",
          fechaActualizacion: new Date(),
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al actualizar descripción del repartidor:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
