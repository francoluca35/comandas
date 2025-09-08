// Prueba específica para RestauranteForm - simula pedido "para llevar"
async function probarRestauranteForm() {
  console.log("🧪 Probando RestauranteForm - Pedido PARA LLEVAR");
  
  const datosRestaurante = {
    mesa: "María González",
    productos: [
      {
        nombre: "Pollo a la Brasa",
        cantidad: 1,
        observacion: "Sin papas"
      },
      {
        nombre: "Coca Cola",
        cantidad: 2,
        observacion: ""
      }
    ],
    orden: Date.now(),
    hora: "15:45",
    fecha: "15/12/2024",
    metodoPago: "efectivo",
    total: 18.50  // Este es el total que debería aparecer en el ticket
  };
  
  console.log("📋 Datos enviados:", JSON.stringify(datosRestaurante, null, 2));
  
  try {
    console.log("\n🔥 Enviando a PARRILLA (pollo a la brasa)...");
    const responseParrilla = await fetch('http://localhost:4000/print', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosRestaurante)
    });
    
    const resultParrilla = await responseParrilla.json();
    console.log("✅ Respuesta parrilla:", resultParrilla);
    
    console.log("\n🍽️ Enviando a COCINA (bebidas)...");
    const responseCocina = await fetch('http://localhost:4000/print', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosRestaurante)
    });
    
    const resultCocina = await responseCocina.json();
    console.log("✅ Respuesta cocina:", resultCocina);
    
    console.log("\n🎉 PRUEBA COMPLETADA - Revisa las impresoras físicas");
    console.log("📄 Los tickets deberían mostrar:");
    console.log("   - TOTAL: $18.50");
    console.log("   - PAGO: EFECTIVO");
    console.log("   - Productos con observaciones");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

probarRestauranteForm();
