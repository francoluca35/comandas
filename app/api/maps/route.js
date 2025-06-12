import { NextResponse } from "next/server";


export async function GET() {
    const { default: clientPromise } = await import('@/lib/mongodb');
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    const pedidos = await db
      .collection("pedidos")
      .find({ timestamp: { $exists: true } }) // ✅ solo pedidos válidos
      .sort({ timestamp: -1 })
      .toArray();

    return NextResponse.json(pedidos);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener los pedidos" },
      { status: 500 }
    );
  }
}