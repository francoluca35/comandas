import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { nombre, direccion, observacion, productos, total, hora, fecha, metodoPago, modo, ip } =
      await req.json();

    // Enviar a la impresora específica usando el servidor externo
    const response = await fetch(
              `http://localhost:4000/print-delivery`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          direccion,
          observacion,
          productos,
          total,
          hora,
          fecha,
          metodoPago,
          modo,
          ip,
        }),
      }
    );

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error en /api/printdelivery:", error);
    return NextResponse.json({ error: "Error en impresión" }, { status: 500 });
  }
}


