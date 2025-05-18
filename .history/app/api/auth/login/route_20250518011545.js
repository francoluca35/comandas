import clientPromise from "@/lib/mongodb";
import { comparePasswords } from "@/utils/encrypt";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.text(); // <-- CAMBIO CRÍTICO
    const { username, password } = JSON.parse(body); // <-- DECODEO MANUAL

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

    const isValid = await comparePasswords(password, user.password);
    if (!isValid) {
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
  } catch (error) {
    console.error("🔥 Error en login:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
