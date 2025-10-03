const express = require("express");
const cors = require("cors");
const net = require("net");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const IP_COCINA = "192.168.1.100";
const IP_PARRILLA = "192.168.1.101";
const PUERTO = 9100;

// Función para enviar a impresora
function imprimirTicket(ip, contenido) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
   
    socket.setTimeout(10000); // 10 segundos de timeout
   
    socket.connect(PUERTO, ip, () => {
      socket.write(contenido, "binary", () => {
        socket.end();
        resolve(`Ticket enviado a ${ip}`);
      });
    });
   
    socket.on("error", (err) => {
      reject(`Error al imprimir en ${ip}: ${err.message}`);
    });
   
    socket.on("timeout", () => {
      socket.destroy();
      reject(`Timeout al conectar con ${ip}`);
    });
  });
}

function generarTicketCocina({
  mesa,
  productos,
  orden,
  hora,
  fecha,
  metodoPago,
  ip,
  mostrarPrecio = true,
}) {
  const doble = "\x1D\x21\x11";
  const tercero = "\x1D\x21\x01";
  const normal = "\x1D\x21\x00";
  const cortar = "\x1D\x56\x00";
  const negrita = "\x1B\x45\x01";

  // Detectar si es para llevar (cuando mesa es un nombre y no un número)
  const esParaLlevar = (isNaN(mesa) && mesa !== undefined) ||
                       (typeof mesa === 'string' && /[a-zA-Z]/.test(mesa));
 
  const titulo = productos.every((p) => p.categoria?.toLowerCase() === "brasas")
    ? "HORNO"
    : "COCINA";

  let ticket = "";
 
  if (esParaLlevar) {
    // Ticket para llevar
    ticket += doble + `     PARA LLEVAR\n`;
    ticket += "======================\n";
    ticket += doble + `CLIENTE: ${mesa}\n`;
    ticket += normal;
    ticket += `ORDEN: ${orden}\nHORA: ${hora}\nFECHA: ${fecha}\n`;
  } else {
    // Ticket de mesa
    ticket += doble + ` ${titulo}\n`;
    ticket += "======================\n";
    ticket += `MESA: ${mesa}\n`;
    ticket += normal;
    ticket += ` ORDEN: ${orden}\nHORA: ${hora}\nFECHA: ${fecha}\n`;
  }
 
  ticket += doble + "======================\n";

  // Agrupar productos por nombre
  const productosAgrupados = productos.reduce((acc, p) => {
    const nombre = p.nombre.toUpperCase();
    if (!acc[nombre]) {
      acc[nombre] = { ...p, cantidad: p.cantidad || 1 };
    } else {
      acc[nombre].cantidad += p.cantidad || 1;
    }
    return acc;
  }, {});

  // Imprimir productos agrupados
  for (const nombre in productosAgrupados) {
    const item = productosAgrupados[nombre];
    ticket += normal + "cant   producto";
    ticket += "\n";
    ticket += doble + `${item.cantidad} ${nombre}\n`;
    // Observación (si hay)
    if (item.observacion && item.observacion.trim() !== "") {
      ticket += negrita + tercero + `(${item.observacion.trim()})\n`;
    }
    // Adicionales (si hay)
    if (item.adicionales && item.adicionales.length > 0) {
      ticket += normal + ` + ${item.adicionales.join(", ")}\n`;
    }
  }
 
  if (esParaLlevar && !mostrarPrecio) {
    // Para tickets de para llevar, NO mostrar precio si mostrarPrecio es false
  }
 
  ticket += "\n\n";
  ticket += "  ==========================\n";
  ticket += "\n\n\n" + cortar;
  return ticket;
}

// 🧾 Generador de ticket delivery o mostrador
function generarTicketDelivery({ nombre, direccion, productos, total, modo, observacion, orden, hora, fecha, mostrarPrecio = true }) {
  const doble = "\x1D\x21\x11";
  const normal = "\x1D\x21\x00";
  const cortar = "\x1D\x56\x00";
  const tercero = "\x1D\x21\x01";
  const negrita = "\x1B\x45\x01";

  const ahora = new Date();
  const horaFinal = hora || ahora.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const fechaFinal = fecha || ahora.toLocaleDateString("es-AR");
  const ordenFinal = orden || Math.floor(Math.random() * 1000000000000);
  const encabezado = modo === "retiro" ? "PARA LLEVAR" : "DELIVERY";

  let ticket = "";
  ticket += doble + `     ${encabezado}\n`;
  ticket += "======================\n";
  ticket += doble;
  ticket += `CLIENTE: ${nombre}\n`;
  if (direccion) ticket += `DIRECCION: ${direccion}\n`;
  ticket += normal;
  ticket += `ORDEN: ${ordenFinal}\n`;
  ticket += `HORA: ${horaFinal}\n`;
  ticket += `FECHA: ${fechaFinal}\n`;
  ticket += doble + "======================\n";

  // Agrupar productos
  const productosAgrupados = productos.reduce((acc, p) => {
    const nombre = p.nombre.toUpperCase();
    if (!acc[nombre]) {
      acc[nombre] = { ...p, cantidad: p.cantidad || 1 };
    } else {
      acc[nombre].cantidad += p.cantidad || 1;
    }
    return acc;
  }, {});

  ticket += normal + "cant   producto\n";
  for (const nombre in productosAgrupados) {
    const item = productosAgrupados[nombre];
    ticket += doble + `${item.cantidad} ${nombre}\n`;
    // Observación (si hay)
    if (item.observacion && item.observacion.trim() !== "") {
      ticket += negrita + tercero + `(${item.observacion.trim()})\n`;
    }
    // Adicionales (si hay)
    if (item.adicionales && item.adicionales.length > 0) {
      ticket += normal + `   + ${item.adicionales.join(", ")}\n`;
    }
  }
 
  // Observación general del pedido
  if (observacion && observacion.trim() !== "") {
    ticket += "\n";
    ticket += doble + "OBSERVACIÓN GENERAL:\n";
    ticket += normal + `${observacion.trim()}\n`;
  }
 
  ticket += "\n\n";
  // Calcular el total si no se proporciona, o usar el proporcionado
  if (modo !== "retiro" && mostrarPrecio) {
    let totalFinal;
    if (total !== null && total !== undefined && total > 0) {
      totalFinal = parseFloat(total) || 0;
    } else {
      totalFinal = productos.reduce((acc, p) => {
        const precio = parseFloat(p.precio) || 0;
        const cantidad = parseInt(p.cantidad) || 1;
        const precioTotal = precio * cantidad;
       
        let adicionalesCosto = 0;
        if (p.adicionales && p.adicionales.length > 0) {
          adicionalesCosto = p.adicionales.length * 200;
        }
       
        return acc + precioTotal + adicionalesCosto;
      }, 0);
    }
   
    ticket += `TOTAL:  $${totalFinal.toFixed(2)} \n`;
  }
  ticket += doble + "======================\n";
  ticket += normal;
  ticket += "\n\n\n";
  ticket += "==========================\n";
  ticket += cortar;

  return ticket;
}

// 🧾 Generador de ticket para llevar (basado en delivery pero CON precio)
function generarTicketParaLlevar({ nombre, productos, orden, hora, fecha, observacion, total, mostrarPrecio = true }) {
  const doble = "\x1D\x21\x11";
  const normal = "\x1D\x21\x00";
  const cortar = "\x1D\x56\x00";
  const tercero = "\x1D\x21\x01";
  const negrita = "\x1B\x45\x01";

  const ahora = new Date();
  const horaFinal = hora || ahora.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const fechaFinal = fecha || ahora.toLocaleDateString("es-AR");
  const ordenFinal = orden || Math.floor(Math.random() * 1000000000000);

  let ticket = "";
  ticket += doble + `     PARA LLEVAR\n`;
  ticket += "======================\n";
  ticket += doble;
  ticket += `CLIENTE: ${nombre}\n`;
  ticket += normal;
  ticket += `ORDEN: ${ordenFinal}\n`;
  ticket += `HORA: ${horaFinal}\n`;
  ticket += `FECHA: ${fechaFinal}\n`;
  ticket += doble + "======================\n";

  // Agrupar productos
  const productosAgrupados = productos.reduce((acc, p) => {
    const nombre = p.nombre.toUpperCase();
    if (!acc[nombre]) {
      acc[nombre] = { ...p, cantidad: p.cantidad || 1 };
    } else {
      acc[nombre].cantidad += p.cantidad || 1;
    }
    return acc;
  }, {});

  ticket += normal + "cant   producto\n";
  for (const nombre in productosAgrupados) {
    const item = productosAgrupados[nombre];
    ticket += doble + `${item.cantidad} ${nombre}\n`;
    // Observación (si hay)
    if (item.observacion && item.observacion.trim() !== "") {
      ticket += negrita + tercero + `(${item.observacion.trim()})\n`;
    }
    // Adicionales (si hay)
    if (item.adicionales && item.adicionales.length > 0) {
      ticket += normal + `   + ${item.adicionales.join(", ")}\n`;
    }
  }  
 
  // Observación general del pedido
  if (observacion && observacion.trim() !== "") {
    ticket += "\n";
    ticket += doble + "OBSERVACIÓN GENERAL:\n";
    ticket += normal + `${observacion.trim()}\n`;
  }
 
  ticket += "\n\n";
  // MOSTRAR precio para "para llevar" si mostrarPrecio es true
  if (mostrarPrecio && total !== null && total !== undefined) {
    ticket += `TOTAL:  $${total || 0.00} \n`;
  }
  ticket += doble + "======================\n";
  ticket += normal;
  ticket += "\n\n\n";
  ticket += "==========================\n";
  ticket += cortar;

  return ticket;
}

// 🖨️ Ruta para pedidos de restaurante (para llevar)
app.post("/print", async (req, res) => {
  try {
    const { mesa, productos, total, orden, hora, fecha, metodoPago, ip, mostrarPrecio = true } = req.body;

    // Si se especifica una IP específica, enviar solo a esa impresora
    if (ip) {
      const ticket = generarTicketCocina({
        mesa,
        productos,
        orden,
        hora,
        fecha,
        metodoPago,
        ip,
        mostrarPrecio,
      });
     
      const resultado = await imprimirTicket(ip, ticket);
      return res.json({
        success: true,
        results: [resultado],
        ip: ip
      });
    }

    // Separar productos por categoría
    const parrilla = productos.filter(
      (p) => p.categoria?.toLowerCase() === "brasas"
    );
    const cocina = productos.filter(
      (p) => p.categoria?.toLowerCase() !== "brasas"
    );

    let resultadoParrilla = "Nada que imprimir";
    let resultadoCocina = "Nada que imprimir";

    console.log("🔍 Debug impresión restaurante:", { 
      parrilla: parrilla.length, 
      cocina: cocina.length,
      total: total,
      mesa: mesa
    });

    // LÓGICA CORREGIDA PARA RESTAURANTE (PARA LLEVAR)
    if (parrilla.length > 0 && cocina.length > 0) {
      // Productos mixtos: Parrilla solo brasas, Cocina 2 tickets (no brasas + todos juntos)
      console.log("🔥🍽️ Para llevar con productos mixtos: enviando tickets separados");
      
      // Ticket 1: Solo brasas para parrilla (SIN precio)
      console.log("🔥 Enviando brasas a parrilla (192.168.1.101) - SIN precio");
      const ticketParrilla = generarTicketCocina({
        mesa,
        productos: parrilla,
        orden,
        hora,
        fecha,
        metodoPago,
        mostrarPrecio: false
      });
      resultadoParrilla = await imprimirTicket(IP_PARRILLA, ticketParrilla);
      
      // Ticket 2: Solo no brasas para cocina (SIN precio)
      console.log("🍽️ Enviando no brasas a cocina (192.168.1.100) - SIN precio");
      const ticketCocinaNoBrasas = generarTicketCocina({
        mesa,
        productos: cocina,
        orden,
        hora,
        fecha,
        metodoPago,
        mostrarPrecio: false
      });
      await imprimirTicket(IP_COCINA, ticketCocinaNoBrasas);
      
      // Ticket 3: TODOS los productos juntos para cocina (CON precio)
      console.log("🍽️ Enviando TODOS los productos a cocina (192.168.1.100) - CON precio");
      const ticketCocinaTodos = generarTicketCocina({
        mesa,
        productos: productos,
        orden,
        hora,
        fecha,
        metodoPago,
        mostrarPrecio: true,
        total
      });
      resultadoCocina = await imprimirTicket(IP_COCINA, ticketCocinaTodos);
      
    } else if (parrilla.length > 0 && cocina.length === 0) {
      // ✅ SOLO BRASAS → imprimir en PARRILLA (SIN precio) y también en COCINA (CON precio)
      console.log("🔥 Solo brasas: enviando a parrilla (SIN precio) y cocina (CON precio)");
      
      // Ticket para parrilla (SIN precio)
      const ticketParrilla = generarTicketCocina({
        mesa,
        productos: parrilla,
        orden,
        hora,
        fecha,
        metodoPago,
        mostrarPrecio: false
      });
      resultadoParrilla = await imprimirTicket(IP_PARRILLA, ticketParrilla);
      
      // Ticket para cocina (CON precio)
      const ticketCocina = generarTicketCocina({
        mesa,
        productos: parrilla,
        orden,
        hora,
        fecha,
        metodoPago,
        mostrarPrecio: true,
        total
      });
      resultadoCocina = await imprimirTicket(IP_COCINA, ticketCocina);
      
    } else if (cocina.length > 0) {
      // Solo productos de cocina (sin brasas) van solo a COCINA
      console.log("🍽️ Solo no brasas: enviando 2 tickets a cocina");
      
      // Ticket 1: SIN precio
      const ticketCocinaSinPrecio = generarTicketCocina({
        mesa,
        productos: cocina,
        orden,
        hora,
        fecha,
        metodoPago,
        mostrarPrecio: false
      });
      await imprimirTicket(IP_COCINA, ticketCocinaSinPrecio);
      
      // Ticket 2: CON precio
      const ticketCocinaConPrecio = generarTicketCocina({
        mesa,
        productos: cocina,
        orden,
        hora,
        fecha,
        metodoPago,
        mostrarPrecio: true,
        total
      });
      resultadoCocina = await imprimirTicket(IP_COCINA, ticketCocinaConPrecio);
    }

    res.json({
      success: true,
      results: [resultadoParrilla, resultadoCocina],
    });
  } catch (err) {
    res.status(500).json({ error: "Error en impresión", message: err.message });
  }
});

// 🚚 Ruta para pedidos delivery o mostrador
app.post("/printdelivery", async (req, res) => {
  try {
    const { nombre, direccion, productos, total, modo, observacion, ip, mostrarPrecio = true } = req.body;

    // Si se especifica una IP específica, enviar solo a esa impresora
    if (ip) {
      const ticket = generarTicketDelivery({
        nombre,
        direccion,
        productos,
        total,
        modo,
        observacion,
        mostrarPrecio,
      });
     
      const resultado = await imprimirTicket(ip, ticket);
      return res.json({
        success: true,
        results: [resultado],
        ip: ip
      });
    }

    // Separar productos por categoría para delivery
    const parrilla = productos.filter(
      (p) => p.categoria?.toLowerCase() === "brasas"
    );
    const cocina = productos.filter(
      (p) => p.categoria?.toLowerCase() !== "brasas"
    );

    let resultadoParrilla = "Nada que imprimir";
    let resultadoCocina = "Nada que imprimir";

    // Para DELIVERY: Si hay brasas, generar UN SOLO TICKET y enviarlo a AMBAS impresoras
    if (parrilla.length > 0) {
      // Generar UN SOLO TICKET con TODOS los productos
      const ticketParaImprimir = generarTicketDelivery({
        nombre,
        direccion,
        productos: productos, // TODOS los productos (no solo parrilla)
        modo,
        observacion,
        mostrarPrecio: false, // Parrilla sin precio
      });
     
      // ENVIAR TICKETS CON DIFERENTES CONFIGURACIONES DE PRECIO
      const ticketParrilla = generarTicketDelivery({
        nombre,
        direccion,
        productos: productos,
        modo,
        observacion,
        mostrarPrecio: false,
      });
     
      const ticketCocina = generarTicketDelivery({
        nombre,
        direccion,
        productos: productos,
        total: total, // Cocina con precio
        modo,
        observacion,
        mostrarPrecio: true,
      });
     
      resultadoParrilla = await imprimirTicket(IP_PARRILLA, ticketParrilla);
      resultadoCocina = await imprimirTicket(IP_COCINA, ticketCocina);
     
    } else if (parrilla.length > 0 && cocina.length === 0) {
      // 🚨 Caso SOLO BRASAS → imprimir en PARRILLA y también en COCINA
      const ticket = generarTicketParaLlevar({
        nombre,
        direccion,
        productos: parrilla,
        total,
        modo,
        observacion,
        mostrarPrecio: true, // con precio
      });

      resultadoParrilla = await imprimirTicket(IP_PARRILLA, ticket);
      resultadoCocina = await imprimirTicket(IP_COCINA, ticket);

    } else if (cocina.length > 0) {
      // Solo productos de cocina (sin brasas) van solo a COCINA
      // Generar 2 tickets: uno sin precio y otro con precio
      const ticketCocinaSinPrecio = generarTicketDelivery({
        nombre,
        direccion,
        productos: cocina,
        total: null,
        modo,
        observacion,
        mostrarPrecio: false, // Sin precio
      });
     
      const ticketCocinaConPrecio = generarTicketDelivery({
        nombre,
        direccion,
        productos: cocina,
        total: total,
        modo,
        observacion,
        mostrarPrecio: true, // Con precio
      });
     
      // Enviar ambos tickets a cocina
      await imprimirTicket(IP_COCINA, ticketCocinaSinPrecio);
      resultadoCocina = await imprimirTicket(IP_COCINA, ticketCocinaConPrecio);
    }

    res.json({
      success: true,
      results: [resultadoParrilla, resultadoCocina],
    });
  } catch (err) {
    res.status(500).json({ error: "Error en impresión", message: err.message });
  }
});

// 🖨️ Ruta de estado del servidor
app.get("/status", (req, res) => {
  res.json({
    status: "running",
    timestamp: new Date().toISOString(),
    impresoras: {
      cocina: IP_COCINA,
      parrilla: IP_PARRILLA,
      puerto: PUERTO
    }
  });
});

// 📋 Ruta para verificar versión del servidor (desde PC remoto)
app.get("/version", (req, res) => {
  const version = {
    version: "1.3.0",
    fecha: new Date().toISOString(),
    cambios: [
      "✅ Precio visible en tickets 'Para Llevar'",
      "✅ Lógica corregida para detección de 'Para Llevar'",
      "✅ Total extraído correctamente del req.body",
      "✅ Tickets duplicados para brasas (parrilla + cocina)",
      "✅ Tickets duplicados para no-brasas (2x cocina)",
      "✅ CORREGIDO: Solo brasas ahora se envía a parrilla Y cocina"
    ],
    servidor: "impresora-local.js",
    puerto: PORT,
    impresoras: {
      cocina: IP_COCINA,
      parrilla: IP_PARRILLA
    }
  };
 
  res.json(version);
});

// 🔍 Ruta para debug completo del servidor
app.get("/debug", (req, res) => {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoria: process.memoryUsage(),
    version: process.version,
    plataforma: process.platform,
    arch: process.arch,
    pid: process.pid,
    configuracion: {
      puerto: PORT,
      ip_cocina: IP_COCINA,
      ip_parrilla: IP_PARRILLA,
      puerto_impresora: PUERTO
    },
    funciones_disponibles: [
      "generarTicketCocina",
      "generarTicketDelivery",
      "generarTicketParaLlevar",
      "imprimirTicket"
    ]
  };
 
  res.json(debugInfo);
});

// 🖨️ Ruta para verificar estado de las impresoras
app.get("/check-printers", async (req, res) => {
  try {
    const resultados = {};
   
    // Verificar impresora de cocina
    try {
      const socketCocina = new net.Socket();
      socketCocina.setTimeout(3000);
     
      await new Promise((resolve, reject) => {
        socketCocina.connect(PUERTO, IP_COCINA, () => {
          socketCocina.end();
          resolve();
        });
       
        socketCocina.on("error", reject);
        socketCocina.on("timeout", () => {
          socketCocina.destroy();
          reject(new Error("Timeout"));
        });
      });
     
      resultados.cocina = {
        ip: IP_COCINA,
        estado: "✅ CONECTADA",
        puerto: PUERTO
      };
    } catch (error) {
      resultados.cocina = {
        ip: IP_COCINA,
        estado: "❌ DESCONECTADA",
        puerto: PUERTO,
        error: error.message
      };
    }
   
    // Verificar impresora de parrilla
    try {
      const socketParrilla = new net.Socket();
      socketParrilla.setTimeout(3000);
     
      await new Promise((resolve, reject) => {
        socketParrilla.connect(PUERTO, IP_PARRILLA, () => {
          socketParrilla.end();
          resolve();
        });
       
        socketParrilla.on("error", reject);
        socketParrilla.on("timeout", () => {
          socketParrilla.destroy();
          reject(new Error("Timeout"));
        });
      });
     
      resultados.parrilla = {
        ip: IP_PARRILLA,
        estado: "✅ CONECTADA",
        puerto: PUERTO
      };
    } catch (error) {
      resultados.parrilla = {
        ip: IP_PARRILLA,
        estado: "❌ DESCONECTADA",
        puerto: PUERTO,
        error: error.message
      };
    }
   
    res.json({
      timestamp: new Date().toISOString(),
      estado: "Verificación completada",
      impresoras: resultados
    });
   
  } catch (error) {
    res.status(500).json({
      error: "Error al verificar impresoras",
      message: error.message
    });
  }
});

// 🔄 Ruta para actualización automática (webhook)
app.post("/trigger-update", async (req, res) => {
  try {
    const { timestamp } = req.body;
    console.log(`🔄 Actualización solicitada a las ${timestamp}`);
   
    // Ejecutar git pull
    const { exec } = require('child_process');
    exec('git pull origin main', { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error al actualizar:', error);
        return res.status(500).json({ error: error.message });
      }
     
      console.log('✅ Código actualizado:', stdout);
     
      // Reiniciar servidor después de 2 segundos
      setTimeout(() => {
        console.log('🔄 Reiniciando servidor...');
        process.exit(0); // PM2 lo reiniciará automáticamente
      }, 2000);
     
      res.json({
        success: true,
        message: 'Actualización iniciada',
        timestamp: new Date().toISOString()
      });
    });
  } catch (err) {
    console.error('❌ Error en trigger-update:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(
    `🖨️  Servidor local de impresión corriendo en http://localhost:${PORT}`
  );
});

process.on("uncaughtException", (err) => {
  console.error("❌ Excepción no atrapada:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Promesa rechazada no manejada:", reason);
});
