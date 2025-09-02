import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { ip, ...restoDatos } = body;

    // Enviar a la impresora específica usando el servidor externo
    const response = await fetch(
      `http://localhost:4000/print`, // Tu servidor local
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...restoDatos,
          ip, // Incluir la IP para que el servidor sepa a dónde enviar
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error en /api/print-ip:", error);
    return NextResponse.json(
      { error: "Error en impresión", message: error.message },
      { status: 500 }
    );
  }
}
