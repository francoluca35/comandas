const express = require("express");
const cors = require("cors");
const net = require("net");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const IP_COCINA = "192.168.0.100";
const IP_PARRILLA = "192.168.0.101";
const PUERTO = 9100;

// Función para enviar a impresora
function imprimirTicket(ip, contenido) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    socket.connect(PUERTO, ip, () => {
      socket.write(contenido, "binary", () => {
        socket.end();
        resolve(`Ticket enviado a ${ip}`);
      });
    });
    socket.on("error", (err) => {
      reject(`Error al imprimir en ${ip}: ${err.message}`);
    });
  });
}

// 🧾 Generador de ticket normal (restaurante)
function generarTicketCocina({
  mesa,
  productos,
  orden,
  hora,
  fecha,
  metodoPago,
  total,
}) {
  const doble = "\x1D\x21\x11";
  const normal = "\x1D\x21\x00";
  const cortar = "\x1D\x56\x00";

  let ticket = "";
  ticket += doble + "     PERU MAR\n";
  ticket += `MESA: ${mesa}\n`;
  ticket += normal;
  ticket += `ORDEN: ${orden}\nHORA: ${hora}\nFECHA: ${fecha}\n`;
  ticket += "==============================\n";

  productos.forEach((p) => {
    ticket += doble + `${p.cantidad || 1}x ${p.nombre.toUpperCase()}\n`;
    ticket += normal;
  });

  ticket += "==============================\n";
  if (total) {
    ticket += `TOTAL: $${total.toFixed(2)}\n`;
  }
  ticket += `PAGO: ${metodoPago?.toUpperCase() || "NO ESPECIFICADO"}\n\n\n`;
  ticket += cortar;

  return ticket;
}

// 🧾 Generador de ticket delivery o mostrador
function generarTicketDelivery({ nombre, direccion, productos, total }) {
  const doble = "\x1D\x21\x11";
  const normal = "\x1D\x21\x00";
  const cortar = "\x1D\x56\x00";

  let ticket = "";
  ticket += doble + "     DELIVERY\n";
  ticket += normal;
  ticket += `Cliente: ${nombre}\n`;
  if (direccion) ticket += `Dirección: ${direccion}\n`;
  ticket += "==============================\n";

  productos.forEach((p) => {
    ticket += `${p.cantidad || 1}x ${p.nombre}\n`;
  });

  ticket += "==============================\n";
  ticket += `TOTAL: $${total?.toFixed(2) || 0}\n\n\n`;
  ticket += cortar;

  return ticket;
}

// 📦 Ruta para pedidos restaurante
app.post("/print", async (req, res) => {
  try {
    const { mesa, productos, orden, hora, fecha, metodoPago, total } = req.body;
    const parrilla = productos.filter((p) =>
      p.nombre.toLowerCase().includes("pollo a la brasa")
    );
    const cocina = productos.filter(
      (p) => !p.nombre.toLowerCase().includes("pollo a la brasa")
    );

    const tareas = [];

    if (parrilla.length > 0) {
      const contenido = generarTicketCocina({
        mesa,
        productos: parrilla,
        orden,
        hora,
        fecha,
        metodoPago,
        total,
      });
      tareas.push(imprimirTicket(IP_PARRILLA, contenido));
    }

    if (cocina.length > 0) {
      const contenido = generarTicketCocina({
        mesa,
        productos: cocina,
        orden,
        hora,
        fecha,
        metodoPago,
      });
      tareas.push(imprimirTicket(IP_COCINA, contenido));
    }

    const resultados = await Promise.allSettled(tareas);

    res.json({
      success: true,
      results: resultados.map((r) =>
        r.status === "fulfilled" ? r.value : r.reason
      ),
    });
  } catch (err) {
    res.status(500).json({ error: "Error al imprimir", message: err.message });
  }
});

// 🚚 Ruta para pedidos delivery o mostrador
app.post("/print-delivery", async (req, res) => {
  try {
    const { nombre, direccion, productos, total } = req.body;
    const contenido = generarTicketDelivery({
      nombre,
      direccion,
      productos,
      total,
    });
    const resultado = await imprimirTicket(IP_COCINA, contenido);
    res.json({ success: true, message: resultado });
  } catch (err) {
    res.status(500).json({ error: "Error en impresión", message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(
    `🖨️  Servidor local de impresión corriendo en http://localhost:${PORT}`
  );
});
