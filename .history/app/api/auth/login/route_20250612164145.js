import { comparePasswords } from "@/utils/encrypt";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const { default: clientPromise } = await import("@/lib/mongodb");

  try {
    const body = await req.text();
    const { username, password } = JSON.parse(body);

    if (!username || !password) {
      return NextResponse.json(
        { error: "Faltan credenciales" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("comandas");

    const user = await db.collection("users").findOne({ username });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 401 }
      );
    }

    // resto de tu lógica...

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
