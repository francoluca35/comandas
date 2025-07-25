// app/api/mercado-pago/ingresos/route.js
import { NextResponse } from "next/server";
import { format } from "date-fns";

export async function GET() {
  try {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    const hoy = new Date();
    const desde = format(hoy, "yyyy-MM-dd");

    const res = await fetch(
      `https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&begin_date=${desde}T00:00:00.000-03:00`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();
    const pagos = data.results || [];

    const pagosAprobados = pagos.filter((p) => p.status === "approved");

    const total = pagosAprobados.reduce(
      (acc, pago) => acc + pago.transaction_amount,
      0
    );

    return NextResponse.json({ ingresosHoy: total });
  } catch (error) {
    console.error("Error obteniendo ingresos MP:", error.message);
    return NextResponse.json(
      { error: "Error al obtener ingresos de Mercado Pago" },
      { status: 500 }
    );
  }
}
