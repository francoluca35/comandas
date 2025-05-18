import clientPromise from "@/lib/mongodb";
import { comparePasswords } from "@/utils/encrypt";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Asegurarte de parsear manualmente el texto por seguridad
    const raw = await req.text();
    if (!raw) {
      return NextResponse.json({ error: "Body vacío" }, { status: 400 });
    }

    const { username, password } = JSON.parse(raw);

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
