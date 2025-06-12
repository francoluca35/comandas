import {
    const { default: clientPromise } = await import('@/lib/mongodb'); NextResponse } from "next/server";
import { ObjectId } from "mongodb";
export async function DELETE(req) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ message: "ID requerido" }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db("comandas");
    const result = await db.collection("menus").deleteOne({
      _id: new ObjectId(id),
    });
    if (result.deletedCount === 1) {
      return NextResponse.json({ message: "Menú eliminado" }, { status: 200 });
    } else {
      return NextResponse.json(
        { message: "No se encontró el menú" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error al eliminar menú:", error);
    return NextResponse.json(
      { message: "Error del servidor" },
      { status: 500 }
    );
  }
}