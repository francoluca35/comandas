import { NextResponse } from "next/server";
// import net from "net";

// const IP_COCINA = "192.168.1.100";
// const IP_PARRILLA = "192.168.1.101";
// const PUERTO = 9100;

export async function POST(req) {
  try {
    const { nombre, direccion, observacion, productos, total, hora, fecha, metodoPago, modo, ip } =
      await req.json();

    // Enviar a la impresora específica usando el servidor externo
    const response = await fetch(
      `https://right-worthy-collie.ngrok-free.app/printdelivery`,
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

    // CÓDIGO COMENTADO - NO SE EJECUTA
    /*
    // Si es delivery o para llevar, enviar el ticket completo a ambas impresoras
    if (modo === "delivery" || modo === "retiro") {
      const enviarTicketCompleto = (ip) => {
        return new Promise((resolve, reject) => {
          const doble = "\x1D\x21\x11";
          const normal = "\x1D\x21\x00";
          const cortar = "\x1D\x56\x00";

          let ticket = "";
          ticket += doble + "     PERU MAR\n";
          ticket += "======================\n";
          ticket += normal;
          ticket += `ORDEN: ${orden}\nHORA: ${hora}\nFECHA: ${fecha}\n`;
          ticket += "==============================\n";

          // Agrupar productos por nombre
          const agrupados = {};
          productos.forEach((p) => {
            const nombre = p.nombre?.toUpperCase();
            if (!nombre) return;
            agrupados[nombre] = (agrupados[nombre] || 0) + (p.cantidad || 1);
          });

          for (const nombre in agrupados) {
            const cantidad = agrupados[nombre];
            ticket += normal + `${cantidad}x ${nombre}\n`;
          }

          ticket += "==============================\n";
          ticket += `PAGO: ${metodoPago?.toUpperCase() || "NO ESPECIFICADO"}\n`;
          ticket += "\n\n\n" + cortar;

          const socket = new net.Socket();
          socket.connect(PUERTO, ip, () => {
            socket.write(ticket, "binary", () => {
              socket.end();
              resolve(`Impreso en ${ip}`);
            });
          });

          socket.on("error", (err) => {
            console.error(`Error en ${ip}:`, err);
            reject(err);
          });
        });
      };

      const resultados = await Promise.allSettled([
        enviarTicketCompleto(IP_PARRILLA),
        enviarTicketCompleto(IP_COCINA),
      ]);

      return NextResponse.json({
        success: true,
        results: resultados.map((r) =>
          r.status === "fulfilled" ? r.value : r.reason.message
        ),
      });
    }

    // Si es restaurante, separar por categoría como antes
    const parrilla = productos.filter(
      (p) => p.categoria?.toLowerCase() === "brasas"
    );
    const cocina = productos.filter(
      (p) => !p.nombre?.toLowerCase().includes("pollo a la brasa")
    );

    const enviarAImpresora = (items, ip) => {
      return new Promise((resolve, reject) => {
        if (items.length === 0) return resolve("Nada que imprimir");

        const doble = "\x1D\x21\x11";
        const normal = "\x1D\x21\x00";
        const cortar = "\x1D\x56\x00";

        let ticket = "";
        ticket += normal + "     PERU MAR\n";
        ticket += `MESA: ${mesa}\n`;
        ticket += normal;
        ticket += `ORDEN: ${orden}\nHORA: ${hora}\nFECHA: ${fecha}\n`;
        ticket += "==============================\n";

        // Agrupar productos por nombre
        const agrupados = {};
        items.forEach((p) => {
          const nombre = p.nombre?.toUpperCase();
          if (!nombre) return;
          agrupados[nombre] = (agrupados[nombre] || 0) + (p.cantidad || 1);
        });

        for (const nombre in agrupados) {
          const cantidad = agrupados[nombre];
          ticket += normal + `${cantidad}x ${nombre}\n`;
        }

        ticket += "==============================\n";
        ticket += `PAGO: ${metodoPago?.toUpperCase() || "NO ESPECIFICADO"}\n`;
        ticket += "\n\n\n" + cortar;

        const socket = new net.Socket();
        socket.connect(PUERTO, ip, () => {
          socket.write(ticket, "binary", () => {
            socket.end();
            resolve(`Impreso en ${ip}`);
          });
        });

        socket.on("error", (err) => {
          console.error(`Error en ${ip}:`, err);
          reject(err);
        });
      });
    };

    const resultados = await Promise.allSettled([
      enviarAImpresora(parrilla, IP_PARRILLA),
      enviarAImpresora(cocina, IP_COCINA),
    ]);

    return NextResponse.json({
      success: true,
      results: resultados.map((r) =>
        r.status === "fulfilled" ? r.value : r.reason.message
      ),
    });
    */
  } catch (error) {
    console.error("Error en /api/printdelivery:", error);
    return NextResponse.json({ error: "Error en impresión" }, { status: 500 });
  }
}


