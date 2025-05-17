import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const body = await req.json();
    const { nombre, adicionales, precio, precioConIVA, descuento, tipo } = body;

    if (
      !nombre ||
      !precio ||
      !precioConIVA ||
      !Array.isArray(adicionales) ||
      !tipo
    ) {
      return NextResponse.json(
        { message: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("comandas");

    const nuevoMenu = {
      nombre,
      tipo,
      adicionales,
      precio,
      precioConIVA,
      ...(descuento && { descuento }),
    };

    const result = await db.collection("menus").insertOne(nuevoMenu);

    return NextResponse.json(
      { message: "Menú agregado correctamente", id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al agregar menú:", error);
    return NextResponse.json(
      { message: "Error del servidor" },
      { status: 500 }
    );
  }
}
