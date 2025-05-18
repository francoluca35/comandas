import clientPromise from "@/lib/mongodb";
import { comparePasswords } from "@/utils/encrypt";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Cuerpo vacío" }, { status: 400 });
    }

    const { username, password } = body;
    if (!username || !password) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
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
        nombreCompleto: user.nombreCompleto,
        rol: user.rol,
      },
    });
  } catch (err) {
    console.error("💥 Error en /api/auth/login:", err.message);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
