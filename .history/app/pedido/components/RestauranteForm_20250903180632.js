"use client";

import { useState, useEffect } from "react";
import useProductos from "@/app/hooks/useProductos";
import { FiPlusCircle, FiTrash2 } from "react-icons/fi";
import Swal from "sweetalert2";
import QRCode from "react-qr-code";

export default function RestauranteForm() {
  const { productos } = useProductos();

  const [nombre, setNombre] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [pago, setPago] = useState("");
  const [urlPago, setUrlPago] = useState("");
  const [externalReference, setExternalReference] = useState("");
  const [presupuesto, setPresupuesto] = useState([]);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [esperandoPago, setEsperandoPago] = useState(false);
  const [comisionMP, setComisionMP] = useState(0);
  const [totalMP, setTotalMP] = useState(0);
  const [enviando, setEnviando] = useState(false); // Protección contra múltiples clics
  const [qrGenerado, setQrGenerado] = useState(false); // Control para evitar regenerar QR

  // Observación general del pedido (para el repartidor)
  const [observacion, setObservacion] = useState("");
  // Observación por producto (para ticket/cocina)
  const [observacionProducto, setObservacionProducto] = useState("");
  const [modoPrueba, setModoPrueba] = useState(true); // 🧪 MODO PRUEBA: true = PDF, false = impresora real

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const calcularTotal = () => {
    return presupuesto.reduce((total, item) => {
      const comidaProd = productos.find((p) => p.nombre === item.comida);
      const bebidaProd = productos.find((p) => p.nombre === item.bebida);
      const base = (comidaProd?.precio || 0) * (item.cantidad || 1);
      const bebidaPrecio = (bebidaProd?.precio || 0) * (item.cantidad || 1);
      return total + base + bebidaPrecio;
    }, 0);
  };

  const total = calcularTotal();

  useEffect(() => {
    setTotalMP(Math.round((Number(total) + Number(comisionMP)) * 100) / 100);
  }, [total, comisionMP]);

  const agregarProducto = () => {
    if (!productoSeleccionado || cantidad < 1) return;
    const tipo = productos.find((p) => p.nombre === productoSeleccionado)?.tipo;
    setPresupuesto((prev) => [
      ...prev,
      {
        comida: tipo !== "bebida" ? productoSeleccionado : "",
        bebida: tipo === "bebida" ? productoSeleccionado : "",
        cantidad,
        observacion: observacionProducto, // Observación por producto
      },
    ]);
    setProductoSeleccionado("");
    setCantidad(1);
    setBusqueda("");
    setObservacionProducto("");
  };

  const eliminarItem = (index) => {
    setPresupuesto((prev) => prev.filter((_, i) => i !== index));
  };

  // Adaptar QR para sumar la comision
  const generarPagoQR = async () => {
    // Evitar regenerar si ya existe un QR
    if (urlPago && qrGenerado) return;
    
    try {
      setQrGenerado(true);
      const res = await fetch("/api/mercado-pago/crear-pago-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total: totalMP, // Incluye la comisión
          nombreCliente: nombre || "Cliente",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setUrlPago(data.init_point);
        setExternalReference(data.external_reference);
        setEsperandoPago(true);
        esperarConfirmacionPago(data.external_reference);
      } else {
        Swal.fire("Error", "No se pudo generar el QR", "error");
        setQrGenerado(false);
      }
    } catch (error) {
      console.error("Error en generarPagoQR:", error);
      setQrGenerado(false);
    }
  };

  const esperarConfirmacionPago = (ref) => {
    let intentos = 0;
    const interval = setInterval(async () => {
      const res = await fetch(`/api/mercado-pago/estado/${ref}`);
      const data = await res.json();

      if (data.status === "approved") {
        clearInterval(interval);
        setEsperandoPago(false);
        enviarPedidoFinal();
      }

      intentos++;
      if (intentos >= 24) {
        clearInterval(interval);
        setEsperandoPago(false);
        Swal.fire("Pago no confirmado", "Intenta nuevamente", "error");
      }
    }, 5000);
  };

  const enviarPedidoFinal = async () => {
    const now = new Date();
    const hora = now.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const fecha = now.toLocaleDateString("es-AR");

    const payload = {
      modoPedido: "restaurante",
      tipo: "entregalocal",
      nombre,
      observacion, // Observación general para el repartidor
      formaDePago: pago,
      comidas: presupuesto,
      total: pago === "qr" ? totalMP : total,
      comision: pago === "qr" ? comisionMP : 0,
      modo: "retiro",
      estado: "en curso",
      fecha: now.toLocaleString("es-AR"),
      timestamp: now,
    };

    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const productosParaImprimir = presupuesto.map((item) => ({
          nombre: item.comida || item.bebida,
          cantidad: item.cantidad,
          observacion: item.observacion, // Para ticket/cocina
        }));

        // Calcular el total para impresión
        const totalParaImprimir = pago === "qr" ? totalMP : total;

        // Lógica inteligente de impresión según tipo de pedido
        const tieneBrasas = presupuesto.some(item => {
          const producto = productos.find(p => p.nombre === (item.comida || item.bebida));
          return producto?.categoria?.toLowerCase() === "brasas";
        });

        console.log("🔍 Debug impresión retiro:", { tieneBrasas, totalProductos: presupuesto.length });

        if (modoPrueba) {
          // 🧪 MODO PRUEBA: Generar PDF en lugar de imprimir
          console.log("🧪 MODO PRUEBA: Generando PDF del ticket");
          generarPDFTicket(productosParaImprimir, totalParaImprimir, tieneBrasas);
        } else {
          // 🖨️ MODO REAL: Imprimir en impresoras físicas
          if (tieneBrasas) {
            // Si tiene brasas: 1 en cocina, 1 en parrilla
            console.log("🔥 Retiro con brasas: enviando a parrilla y cocina");
            await fetch("/api/print", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                mesa: nombre, // Usar nombre como mesa para compatibilidad
                productos: productosParaImprimir,
                total: totalParaImprimir, // Agregar precio total
                orden: Date.now(),
                hora,
                fecha,
              metodoPago: pago,
                ip: "192.168.1.101", // IP de parrilla
              }),
            });

            await fetch("/api/print", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                mesa: nombre, // Usar nombre como mesa para compatibilidad
                productos: productosParaImprimir,
                total: totalParaImprimir, // Agregar precio total
                orden: Date.now(),
                hora,
                fecha,
                metodoPago: pago,
                ip: "192.168.1.100", // IP de cocina
              }),
            });
          } else {
            // Si NO tiene brasas: 2 en cocina, 0 en parrilla
            console.log("🍽️ Retiro sin brasas: enviando 2 a cocina");
            await fetch("/api/print", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                mesa: nombre, // Usar nombre como mesa para compatibilidad
                productos: productosParaImprimir,
                total: totalParaImprimir, // Agregar precio total
                orden: Date.now(),
                hora,
                fecha,
                metodoPago: pago,
                ip: "192.168.1.100", // IP de cocina
              }),
            });

            await fetch("/api/print", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                mesa: nombre, // Usar nombre como mesa para compatibilidad
                productos: productosParaImprimir,
                total: totalParaImprimir, // Agregar precio total
                orden: Date.now(),
                hora,
                fecha,
                metodoPago: pago,
                ip: "192.168.1.100", // IP de cocina (segunda vez)
              }),
            });
          }
        }

        if (modoPrueba) {
          Swal.fire("PDF de Prueba Generado", "El ticket se mostró en una nueva ventana", "success");
        } else {
          Swal.fire("Pedido enviado correctamente", "Se imprimió en las impresoras", "success");
        }
        resetFormulario();
      } else {
        Swal.fire("Error", "No se pudo enviar el pedido", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire("Error", "Hubo un problema al enviar", "error");
    } finally {
      setEnviando(false);
    }
  };

  const resetFormulario = () => {
    setNombre("");
    setBusqueda("");
    setProductoSeleccionado("");
    setCantidad(1);
    setPago("");
    setPresupuesto([]);
    setUrlPago("");
    setExternalReference("");
    setEsperandoPago(false);
    setComisionMP(0);
    setObservacion("");
    setObservacionProducto("");
    setQrGenerado(false); // Resetear el estado del QR
    setEnviando(false);
  };

  // 🧪 FUNCIÓN DE PRUEBA: Generar PDF del ticket que se imprimiría
  const generarPDFTicket = (productosParaImprimir, totalParaImprimir, tieneBrasas) => {
    const now = new Date();
    const hora = now.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const fecha = now.toLocaleDateString("es-AR");
    const orden = Date.now();

    // Generar HTML del ticket (formato similar al que se imprimiría)
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Ticket Para Llevar - Prueba</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              width: 80mm;
              margin: 0 auto;
              padding: 10px;
              background: white;
              color: black;
            }
            .header {
              text-align: center;
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 10px;
              border-bottom: 2px solid black;
              padding-bottom: 5px;
            }
            .info {
              margin: 5px 0;
              font-size: 14px;
            }
            .divider {
              border-top: 1px dashed black;
              margin: 10px 0;
            }
            .producto {
              margin: 5px 0;
              font-size: 14px;
            }
            .cantidad {
              font-weight: bold;
            }
            .observacion {
              font-style: italic;
              color: #666;
              margin-left: 20px;
              font-size: 12px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #666;
            }
            .impresora {
              background: #f0f0f0;
              padding: 5px;
              margin: 10px 0;
              border-radius: 5px;
              font-size: 12px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">PARA LLEVAR</div>
          
          <div class="info"><strong>CLIENTE:</strong> ${nombre}</div>
          <div class="info"><strong>ORDEN:</strong> ${orden}</div>
          <div class="info"><strong>HORA:</strong> ${hora}</div>
          <div class="info"><strong>FECHA:</strong> ${fecha}</div>
          
          <div class="divider"></div>
          
          <div class="info"><strong>cant   producto</strong></div>
          ${productosParaImprimir.map(item => `
            <div class="producto">
              <span class="cantidad">${item.cantidad}</span> ${item.nombre.toUpperCase()}
              ${item.observacion ? `<div class="observacion">📝 ${item.observacion}</div>` : ''}
            </div>
          `).join('')}
          
          <div class="divider"></div>
          
          <div class="info"><strong>TOTAL:</strong> $${totalParaImprimir.toFixed(2)}</div>
          
          <div class="divider"></div>
          
          ${tieneBrasas ? `
            <div class="impresora">🖨️ IMPRESORA: Parrilla (192.168.1.101)</div>
            <div class="impresora">🖨️ IMPRESORA: Cocina (192.168.1.100)</div>
          ` : `
            <div class="impresora">🖨️ IMPRESORA: Cocina (192.168.1.100) - 2 tickets</div>
          `}
          
          <div class="footer">
            <strong>🧪 MODO PRUEBA - PDF</strong><br>
            Este es el ticket que se imprimiría en la impresora real
          </div>
        </body>
      </html>
    `;

    // Abrir en nueva ventana para imprimir como PDF
    const ventana = window.open("", "", "width=400,height=600");
    if (ventana) {
      ventana.document.write(html);
      ventana.document.close();
      
      // Mostrar mensaje de éxito
      Swal.fire({
        icon: "success",
        title: "PDF de Prueba Generado",
        text: "Se abrió una nueva ventana con el ticket. Puedes imprimir como PDF desde ahí.",
        timer: 3000,
        showConfirmButton: false,
      });
    }
  };

  const manejarPedido = async () => {
    if (!nombre || presupuesto.length === 0 || !pago) {
      Swal.fire("Completa todos los campos", "", "warning");
      return;
    }

    if (enviando) return; // Proteger contra múltiples clics
    setEnviando(true);

    try {
      if (pago === "efectivo") {
        await enviarPedidoFinal();
      } else if (pago === "qr") {
        await generarPagoQR();
      }
    } catch (error) {
      console.error("Error en manejarPedido:", error);
      setEnviando(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* 🧪 Toggle Modo Prueba */}
      <div className="flex justify-center mb-6">
        <div className="bg-black/20 p-3 rounded-xl border border-white/10">
          <label className="flex items-center gap-3 text-white">
            <input
              type="checkbox"
              checked={modoPrueba}
              onChange={(e) => setModoPrueba(e.target.checked)}
              className="w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500"
            />
            <span className="font-semibold">
              {modoPrueba ? "🧪 MODO PRUEBA (PDF)" : "🖨️ MODO REAL (Impresora)"}
            </span>
          </label>
          <p className="text-xs text-gray-400 mt-1 text-center">
            {modoPrueba 
              ? "Genera PDF para verificar el formato del ticket" 
              : "Envía a impresoras físicas reales"
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* LADO IZQUIERDO */}
      <div className="flex flex-col gap-4 bg-black/20 p-6 rounded-xl">
        {/* Productos */}
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Buscar comida o bebida..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setMostrarDropdown(true);
            }}
            onFocus={() => setMostrarDropdown(true)}
            className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20"
          />
          {mostrarDropdown && productosFiltrados.length > 0 && (
            <ul className="absolute z-10 w-full bg-white text-black rounded-xl shadow-md max-h-40 overflow-y-auto">
              {productosFiltrados.map((p) => (
                <li
                  key={p._id}
                  className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                  onClick={() => {
                    setProductoSeleccionado(p.nombre);
                    setBusqueda(p.nombre);
                    setMostrarDropdown(false);
                  }}
                >
                  {p.nombre}
                </li>
              ))}
            </ul>
          )}

          <input
            type="number"
            min={1}
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))}
            className=" px-4 py-2 bg-white/10 text-white rounded-xl border border-white/20"
          />
          {/* Observación por producto */}
          <input
            type="text"
            placeholder="Obs. para cocina (opcional)"
            value={observacionProducto}
            onChange={(e) => setObservacionProducto(e.target.value)}
            className=" px-4 py-2 bg-white/10 text-white rounded-xl border border-white/20"
          />

          <button
            onClick={agregarProducto}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl mt-2"
          >
            <div className="flex items-center justify-center gap-2">
              <FiPlusCircle /> Agregar producto
            </div>
          </button>
        </div>

        {/* Resumen de productos */}
        {presupuesto.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">
              Resumen:
            </h3>
            <ul className="space-y-2 text-sm text-gray-200">
              {presupuesto.map((item, index) => (
                <li key={index} className="flex flex-col gap-0.5">
                  <div className="flex justify-between items-center">
                    <span>
                      {item.cantidad}x {item.comida || item.bebida}
                    </span>
                    <button
                      onClick={() => eliminarItem(index)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                  {item.observacion && (
                    <div className="ml-2 text-cyan-300 italic text-xs">
                      📝 {item.observacion}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* LADO DERECHO */}
      <div className="flex flex-col gap-6 bg-black/10 p-6 rounded-xl">
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20"
          placeholder="Nombre del cliente"
        />

        <select
          value={pago}
          onChange={(e) => setPago(e.target.value)}
          className="w-full px-4 py-3 mb-4 bg-white/10 text-white rounded-xl border border-white/20"
        >
          <option className="text-black" value="">
            Forma de pago
          </option>
          <option className="text-black" value="efectivo">
            Efectivo
          </option>
          <option className="text-black" value="qr">
            Mercado Pago QR
          </option>
        </select>

        {/* Solo mostrar campo comisión si se elige QR */}
        {pago === "qr" && (
          <div className="mb-4 text-center">
            <label className="block text-gray-300 font-bold text-center mb-2">
              Agregar comisión Mercado Pago
            </label>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-gray-700 text-sm">$</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={comisionMP === 0 ? "" : comisionMP}
                onChange={(e) => {
                  let value = e.target.value;
                  if (
                    value.startsWith("0") &&
                    value.length > 1 &&
                    !value.startsWith("0.")
                  ) {
                    value = value.replace(/^0+/, "");
                  }
                  const floatValue = parseFloat(value);
                  setComisionMP(isNaN(floatValue) ? 0 : floatValue);
                }}
                className="w-24 border px-2 py-1 rounded text-center"
                placeholder="0.00"
              />
              <span className="text-gray-700 text-xs">(opcional)</span>
            </div>
            <div className="text-center mt-1 mb-2">
              <span className="text-gray-800 font-bold">
                Total a cobrar: ${totalMP.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {pago === "qr" && urlPago && (
          <div className="flex flex-col items-center gap-2 mb-4">
            <QRCode value={urlPago} size={200} />
            {esperandoPago && (
              <p className="text-sm text-white mt-2">
                Esperando confirmación de pago...
              </p>
            )}
          </div>
        )}

        <p className="text-right text-lg font-bold text-cyan-300 mb-4">
          Total: ${total.toFixed(2)}
        </p>

        <button
          onClick={manejarPedido}
          disabled={enviando}
          className={`w-full text-white font-bold py-3 rounded-xl ${
            enviando 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-cyan-600 hover:bg-cyan-700'
          }`}
        >
          {enviando ? 'Enviando...' : 'Hacer Pedido'}
        </button>
      </div>
      </div>
    </div>
  );
}
