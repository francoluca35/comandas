import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { comparePasswords } from "@/utils/encrypt";

export async function POST(req) {
  const { username, password } = await req.json();

  const client = await clientPromise;
  const db = client.db("comandas");

  const user = await db.collection("users").findOne({ username });
  if (!user)
    return NextResponse.json({ error: "No existe usuario" }, { status: 401 });

  const valid = await comparePasswords(password, user.password);
  if (!valid)
    return NextResponse.json(
      { error: "Contraseña incorrecta" },
      { status: 401 }
    );

  // ✅ Devolvemos también el rol
  return NextResponse.json({
    user: {
      username: user.username,
      email: user.email,
      rol: user.rol,
      nombreCompleto: user.nombreCompleto,
    },
  });
}
