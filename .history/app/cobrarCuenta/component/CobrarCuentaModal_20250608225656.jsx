"use client";
import { useEffect, useState } from "react";

export default function CobrarCuentaModal({
  onClose,
  mesa,
  productos,
  total,
  nombreCliente,
  refetch,
}) {
  const [paso, setPaso] = useState("seleccion");
  const [metodo, setMetodo] = useState("");

  const subtotal = productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  const descuento = productos.reduce(
    (acc, p) => acc + (p.descuento || 0) * p.cantidad,
    0
  );
  const iva = (subtotal - descuento) * 0.18;
  const totalFinal = subtotal - descuento + iva;

  const imprimirTicket = (orden, metodoPago, hora, fecha) => {
    const comidas = productos.filter((p) => p.tipo !== "bebida");
    const bebidas = productos.filter((p) => p.tipo === "bebida");

    const html = `
    <html>
      <head>
        <style>
          body { font-family: monospace; font-size: 12px; padding: 10px; text-align: center; }
          h2 { margin: 10px 0 5px; }
          hr { border: none; border-top: 1px dashed #000; margin: 10px 0; }
          ul { text-align: left; padding-left: 0; list-style: none; }
        </style>
      </head>
      <body>
        <img src="${
          window.location.origin
        }/Assets/logo-peru-mar.png" style="width: 80px;" />
        <h2>🍽️ Perú Mar</h2>
        <p><strong>Mesa:</strong> ${mesa.numero}</p>
        <p><strong>Orden #:</strong> ${orden}</p>
        <p><strong>Hora:</strong> ${hora}</p>
        <p><strong>Fecha:</strong> ${fecha}</p>
        <hr />
      <ul>
  ${productos
    .map(
      (p) =>
        `<li>${p.cantidad}x ${p.nombre} - $${(p.precio * p.cantidad).toFixed(
          2
        )}</li>`
    )
    .join("")}
</ul>

        <hr />
        <p>Subtotal: $${subtotal.toFixed(2)}</p>
        <p>Descuento: -$${descuento.toFixed(2)}</p>
        <p><strong>Total: $${subtotal.toFixed(2)}</strong></p>
        <p><strong>Pago:</strong> ${metodoPago}</p>
        <hr />
        <script>
          window.onload = function() {
            window.print();
            setTimeout(() => window.close(), 500);
          };
        </script>
      </body>
    </html>`;

    const nuevaVentana = window.open("", "Ticket", "width=300,height=600");
    nuevaVentana.document.write(html);
    nuevaVentana.document.close();
  };

  const confirmarPago = async (tipo) => {
    const orden = Date.now();
    const hora = new Date().toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const fecha = new Date().toLocaleDateString("es-AR");

    if (tipo === "efectivo") {
      imprimirTicket(orden, "Efectivo", hora, fecha);
    } else if (tipo === "mp") {
      setPaso("qr");
      setMetodo("Mercado Pago");
      setTimeout(() => {
        imprimirTicket(orden, "Mercado Pago", hora, fecha);
        setPaso("finalizado");
      }, 10000); // Simula pago con Mercado Pago
      return;
    }

    await fetch("/api/mesas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codigo: mesa.codigo,
        productos: [],
        metodoPago: "",
        total: 0,
        estado: "libre",
        hora: "",
        fecha: "",
      }),
    });

    refetch?.();
    onClose();
  };

  if (paso === "qr") {
    return (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
        <div className="bg-white text-black rounded-xl p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Escanea y paga</h2>
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://mpago.la/2V8DzGG"
            alt="QR Mercado Pago"
            className="mx-auto mb-2"
          />
          <p className="text-sm text-gray-600">
            Esperando pago de Mercado Pago...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white text-black rounded-xl p-6 w-full max-w-sm space-y-4">
        <h2 className="text-lg font-semibold text-center">
          Selecciona el método de pago
        </h2>
        <button
          onClick={() => confirmarPago("efectivo")}
          className="w-full py-2 bg-green-600 text-white rounded-lg"
        >
          Efectivo
        </button>
        <button
          onClick={() => confirmarPago("mp")}
          className="w-full py-2 bg-blue-600 text-white rounded-lg"
        >
          Mercado Pago
        </button>
        <button
          onClick={onClose}
          className="w-full py-2 bg-gray-400 text-black rounded-lg"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
