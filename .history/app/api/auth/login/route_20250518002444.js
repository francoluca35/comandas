import clientPromise from "@/lib/mongodb";
import { comparePasswords } from "@/utils/encrypt";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    const client = await clientPromise;
    const db = client.db("comandas");

    const user = await db.collection("users").findOne({ username });
    if (!user) {
      return NextResponse.json({ error: "No existe usuario" }, { status: 401 });
    }

    const valid = await comparePasswords(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        username: user.username,
        email: user.email,
        rol: user.rol,
        nombreCompleto: user.nombreCompleto,
      },
    });
  } catch (err) {
    console.error("💥 Error en /api/auth/login:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
