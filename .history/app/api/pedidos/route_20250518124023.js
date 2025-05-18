import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// POST: Guardar nuevo pedido
export async function POST(req) {
  try {
    const pedido = await req.json();

    const client = await clientPromise;
    const db = client.db("comandas");
    const collection = db.collection("pedidos");

    const ahora = new Date();

    const nuevoPedido = {
      ...pedido,
      estado: pedido.estado || "en curso",
      fecha: ahora.toLocaleString("es-AR"), // para mostrar al usuario
      timestamp: ahora.toISOString(), // para ordenar en backend
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

// GET: Obtener pedidos ordenados del más reciente al más antiguo
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    const pedidos = await db
      .collection("pedidos")
      .find()
      .sort({ timestamp: -1 }) // 👈 Orden descendente por fecha
      .toArray();

    return NextResponse.json(pedidos);
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
