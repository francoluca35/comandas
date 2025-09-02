import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { ip } = body;

    // Si se especifica una IP, usar la ruta específica para impresión por IP
    if (ip) {
      const response = await fetch(
        "https://right-worthy-collie.ngrok-free.app/print", // Ruta para impresión
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();
      return NextResponse.json({ success: true, data });
    }

    // Si no hay IP, usar la ruta normal
    const response = await fetch(
      "https://right-worthy-collie.ngrok-free.app/print", // Tu servidor local con ngrok
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Error al conectar con servidor local:", err);
    return NextResponse.json(
      { error: "Error al imprimir desde Vercel" },
      { status: 500 }
    );
  }
}
