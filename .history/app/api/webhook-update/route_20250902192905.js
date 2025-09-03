import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { secret } = await req.json();
    
    // Verificar secret para seguridad
    if (secret !== process.env.WEBHOOK_SECRET) {
      console.log("❌ Webhook no autorizado");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log("🔄 Webhook recibido, enviando señal de actualización...");
    
    // Enviar señal de actualización al servidor del cliente
    const response = await fetch('http://192.168.1.100:4000/trigger-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timestamp: new Date().toISOString() })
    });
    
    if (!response.ok) {
      throw new Error(`Error del servidor cliente: ${response.status}`);
    }
    
    const result = await response.json();
    console.log("✅ Señal enviada al servidor cliente:", result);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Actualización iniciada en servidor cliente',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ Error en webhook:", error);
    return NextResponse.json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
