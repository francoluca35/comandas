// Usar fetch nativo de Node.js (disponible desde v18)

// Datos de prueba para simular un pedido de "para llevar"
const datosPrueba = {
  mesa: "Juan Pérez",
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
    },
    {
      nombre: "Ensalada César",
      cantidad: 1,
      observacion: "Sin crutones"
    }
  ],
  orden: Date.now(),
  hora: "14:30",
  fecha: "15/12/2024",
  metodoPago: "efectivo",
  total: 25.50
};

async function probarImpresion() {
  console.log("🧪 INICIANDO PRUEBA DE IMPRESIÓN");
  console.log("📋 Datos de prueba:", JSON.stringify(datosPrueba, null, 2));
  
  try {
    // Probar con parrilla (debería incluir pollo a la brasa)
    console.log("\n🔥 Probando impresión en PARRILLA...");
    const responseParrilla = await fetch('http://localhost:4000/print', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosPrueba)
    });
    
    const resultParrilla = await responseParrilla.json();
    console.log("✅ Respuesta parrilla:", resultParrilla);
    
    // Probar con cocina (debería incluir bebidas y ensalada)
    console.log("\n🍽️ Probando impresión en COCINA...");
    const responseCocina = await fetch('http://localhost:4000/print', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosPrueba)
    });
    
    const resultCocina = await responseCocina.json();
    console.log("✅ Respuesta cocina:", resultCocina);
    
    console.log("\n🎉 PRUEBA COMPLETADA");
    
  } catch (error) {
    console.error("❌ Error en la prueba:", error.message);
  }
}

// Ejecutar la prueba
probarImpresion();
