import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const pedido = await req.json();

    const client = await clientPromise;
    const db = client.db("comandas"); // podés cambiar si usás otro nombre
    const collection = db.collection("pedidos");

    const nuevoPedido = {
      ...pedido,
      estado: pedido.estado || "en curso",
      fecha: pedido.fecha || new Date().toISOString(),
    };

    const resultado = await collection.insertOne(nuevoPedido);

    return NextResponse.json({
      success: true,
      message: "Pedido guardado correctamente",
      id: resultado.insertedId,
    });
  } catch (error) {
    console.error("Error al guardar pedido:", error);
    return NextResponse.json(
      { error: "Error al guardar el pedido" },
      { status: 500 }
    );
  }
}
