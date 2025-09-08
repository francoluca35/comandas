// Prueba simple para verificar que el servidor responde
async function probarServidor() {
  console.log("🧪 Probando conexión al servidor...");
  
  try {
    const response = await fetch('http://localhost:4000/print', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mesa: "Test",
        productos: [{ nombre: "Test Product", cantidad: 1 }],
        orden: Date.now(),
        hora: "14:30",
        fecha: "15/12/2024",
        metodoPago: "efectivo",
        total: 10.00
      })
    });
    
    console.log("✅ Servidor responde:", response.status);
    const result = await response.json();
    console.log("📄 Respuesta:", result);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

probarServidor();
