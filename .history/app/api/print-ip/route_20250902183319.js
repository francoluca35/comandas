import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { ip, nombre, direccion, observacion, productos, total, hora, fecha, metodoPago, modo, tipoTicket } = body;

    // Validar que se haya enviado una IP
    if (!ip) {
      return NextResponse.json({ error: "IP de impresora no especificada" }, { status: 400 });
    }

    // Enviar a la impresora específica
    const response = await fetch(
      `https://right-worthy-collie.ngrok-free.app/print`, // Ruta para impresión
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ip,
          nombre,
          direccion,
          observacion,
          productos,
          total,
          hora,
          fecha,
          metodoPago,
          modo,
        }),
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
