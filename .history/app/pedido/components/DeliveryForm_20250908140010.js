"use client";

import { useState, useEffect } from "react";
import useProductos from "@/app/hooks/useProductos";
import { FiPlusCircle, FiTrash2 } from "react-icons/fi";
import Swal from "sweetalert2";
import QRCode from "react-qr-code";

export default function DeliveryForm() {
  const { productos } = useProductos();

  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [observacion, setObservacion] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [pago, setPago] = useState("");
  const [urlPago, setUrlPago] = useState("");
  const [externalReference, setExternalReference] = useState("");
  const [presupuesto, setPresupuesto] = useState([]);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [comisionMP, setComisionMP] = useState(0);
  const [observacionProducto, setObservacionProducto] = useState("");
  const [total, setTotal] = useState(0);
  const [totalMP, setTotalMP] = useState(0);
  const [enviando, setEnviando] = useState(false); // Protección contra múltiples clics
  const [linkGenerado, setLinkGenerado] = useState(false); // Control para evitar regenerar link

  // Calcular el total cada vez que cambia el presupuesto
  useEffect(() => {
    const t = presupuesto.reduce((total, item) => {
      const comidaProd = productos.find((p) => p.nombre === item.comida);
      const bebidaProd = productos.find((p) => p.nombre === item.bebida);
      const base = (comidaProd?.precio || 0) * (item.cantidad || 1);
      const bebidaPrecio = (bebidaProd?.precio || 0) * (item.cantidad || 1);
      return total + base + bebidaPrecio;
    }, 0);
    setTotal(t);
  }, [presupuesto, productos]);

  // Calcular el total + comision si es link
  useEffect(() => {
    setTotalMP(Math.round((Number(total) + Number(comisionMP)) * 100) / 100);
  }, [total, comisionMP]);

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const agregarProducto = () => {
    if (!productoSeleccionado || cantidad < 1) return;
    const tipo = productos.find((p) => p.nombre === productoSeleccionado)?.tipo;
    setPresupuesto((prev) => [
      ...prev,
      {
        comida: tipo !== "bebida" ? productoSeleccionado : "",
        bebida: tipo === "bebida" ? productoSeleccionado : "",
        cantidad,
        observacion: observacionProducto,
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

  // Mercado Pago
  const generarPagoDelivery = async () => {
    // Evitar regenerar si ya existe un link
    if (urlPago && linkGenerado) return;
    
    try {
      setLinkGenerado(true);
      const res = await fetch("/api/mercado-pago/crear-pago-delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total: totalMP, // Incluye la comisión!
          nombreCliente: nombre || "Cliente",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setUrlPago(data.init_point);
        setExternalReference(data.external_reference);
      } else {
        console.error("Error al generar el link:", data.error);
        setLinkGenerado(false);
      }
    } catch (err) {
      console.error("Error en generarPagoDelivery:", err);
      setLinkGenerado(false);
    }
  };

  // useEffect optimizado para evitar múltiples llamadas
  useEffect(() => {
    if (pago === "link" && total > 0 && !linkGenerado) {
      generarPagoDelivery();
    }
  }, [pago, totalMP, linkGenerado]); // Agregamos linkGenerado como dependencia

  const esperarConfirmacionPago = () => {
    let intentos = 0;
    const interval = setInterval(async () => {
      const res = await fetch(`/api/mercado-pago/estado/${externalReference}`);
      const data = await res.json();
      if (data.status === "approved") {
        clearInterval(interval);
        Swal.close();
        enviarPedidoFinal();
      }
      intentos++;
      if (intentos >= 24) {
        clearInterval(interval);
        Swal.fire("Pago no confirmado", "Intenta nuevamente.", "error");
      }
    }, 5000);
  };

  const enviarPedido = async () => {
    // Protección contra múltiples clics
    if (enviando) return;
    
    if (!nombre || !direccion || presupuesto.length === 0 || !pago) {
      Swal.fire("Completa todos los campos", "", "warning");
      return;
    }

    setEnviando(true);

    try {
      if (pago === "efectivo") {
        await enviarPedidoFinal();
      } else if (pago === "link") {
        if (!urlPago) {
          await generarPagoDelivery();
        }
        esperarConfirmacionPago();
        Swal.fire({
          title: "Esperando pago...",
          html: "Por favor, espera mientras se confirma el pago.",
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
      }
    } catch (error) {
      console.error("Error en enviarPedido:", error);
      setEnviando(false);
    }
  };

  const enviarPedidoFinal = async () => {
    const now = new Date();
    const hora = now.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const fecha = now.toLocaleDateString("es-AR");

    const payload = {
      modoPedido: "delivery",
      tipo: "delivery",
      nombre,
      direccion,
      observacion,
      formaDePago: pago,
      comidas: presupuesto,
      total: pago === "link" ? totalMP : total, // Si es link, suma comision
      comision: pago === "link" ? comisionMP : 0,
      modo: "envio",
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
        const productosParaImprimir = presupuesto.map((item) => {
          const producto = productos.find(p => p.nombre === (item.comida || item.bebida));
          return {
            nombre: item.comida || item.bebida,
            cantidad: item.cantidad,
            observacion: item.observacion, // Para ticket/cocina
            precio: producto?.precio || 0, // Incluir el precio del producto
            categoria: producto?.categoria || "", // Incluir la categoría para detectar brasas
            adicionales: item.adicionales || [] // Incluir adicionales si los hay
          };
        });

        // Separar productos por categoría para tickets separados
        const productosBrasas = productosParaImprimir.filter(p => {
          const producto = productos.find(prod => prod.nombre === p.nombre);
          return producto?.categoria?.toLowerCase() === "brasas";
        });
        const productosNoBrasas = productosParaImprimir.filter(p => {
          const producto = productos.find(prod => prod.nombre === p.nombre);
          return producto?.categoria?.toLowerCase() !== "brasas";
        });
        
        const tieneBrasas = productosBrasas.length > 0;
        const tieneNoBrasas = productosNoBrasas.length > 0;

        console.log("🔍 Debug impresión delivery mixta:", { 
          tieneBrasas, 
          tieneNoBrasas,
          productosBrasas: productosBrasas.length,
          productosNoBrasas: productosNoBrasas.length,
          totalProductos: presupuesto.length 
        });

        const enviarAImpresoraDelivery = async (items, ip, tipoImpresora) => {
          if (items.length === 0) return;
          
          console.log(`📤 Enviando a ${tipoImpresora}:`, { ip, items: items.length, cliente: nombre });
          
          try {
            const res = await fetch("/api/printdelivery", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                nombre,
                direccion,
                observacion,
                productos: items,
                total: pago === "link" ? totalMP : total,
                hora,
                fecha,
                metodoPago: pago,
                modo: "envio",
                ip,
              }),
            });
            
            console.log(`📥 Respuesta ${tipoImpresora}:`, { status: res.status, ok: res.ok });
            
            if (!res.ok) throw new Error();
          } catch (err) {
            console.error(`❌ Error al imprimir en ${tipoImpresora}:`, err);
            Swal.fire("Error", `No se pudo imprimir el ticket de ${tipoImpresora}`, "error");
          }
        };

        if (tieneBrasas && tieneNoBrasas) {
          // Productos mixtos: Parrilla solo brasas, Cocina 2 tickets (no brasas + todos juntos)
          console.log("🔥🍽️ Delivery con productos mixtos: enviando tickets separados");
          
          // Ticket 1: Solo brasas para parrilla
          console.log("🔥 Enviando brasas a parrilla (192.168.1.101)");
          await enviarAImpresoraDelivery(productosBrasas, "192.168.1.101", "parrilla");
          
          // Ticket 2: Solo no brasas para cocina
          console.log("🍽️ Enviando no brasas a cocina (192.168.1.100)");
          await enviarAImpresoraDelivery(productosNoBrasas, "192.168.1.100", "cocina (solo no brasas)");
          
          // Ticket 3: TODOS los productos juntos para cocina
          console.log("🍽️ Enviando TODOS los productos a cocina (192.168.1.100)");
          await enviarAImpresoraDelivery(productosParaImprimir, "192.168.1.100", "cocina (todos juntos)");
          
        } else if (tieneBrasas) {
          // Solo brasas: 1 ticket en parrilla
          console.log("🔥 Solo brasas: enviando a parrilla (192.168.1.101)");
          await enviarAImpresoraDelivery(productosBrasas, "192.168.1.101", "parrilla");
          
        } else if (tieneNoBrasas) {
          // Solo no brasas: 2 tickets en cocina (como antes)
          console.log("🍽️ Solo no brasas: enviando 2 tickets a cocina");
          await enviarAImpresoraDelivery(productosNoBrasas, "192.168.1.100", "cocina");
          await enviarAImpresoraDelivery(productosNoBrasas, "192.168.1.100", "cocina (duplicado)");
        }

        Swal.fire("Pedido enviado correctamente", "", "success");
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
    setDireccion("");
    setObservacion("");
    setBusqueda("");
    setProductoSeleccionado("");
    setCantidad(1);
    setPago("");
    setPresupuesto([]);
    setUrlPago("");
    setExternalReference("");
    setComisionMP(0);
    setLinkGenerado(false);
    setEnviando(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto">
      {/* LADO IZQUIERDO */}
      <div className="flex flex-col gap-4 bg-black/20 p-6 rounded-xl">
        {/* Bloque para agregar productos */}
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

          <input
            type="text"
            placeholder="Observación (opcional)"
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
          placeholder="Nombre del cliente"
          className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20"
        />
        <input
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          placeholder="Dirección"
          className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20"
        />
        <textarea
          value={observacion}
          onChange={(e) => setObservacion(e.target.value)}
          rows={2}
          placeholder="Observación (opcional)"
          className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20"
        />
        <select
          value={pago}
          onChange={(e) => setPago(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20"
        >
          <option className="text-black" value="">
            Forma de pago
          </option>
          <option className="text-black" value="efectivo">
            Efectivo
          </option>
          <option className="text-black" value="link">
            Link de pago
          </option>
        </select>

        {pago === "link" && (
          <div className="my-4 text-center">
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
            {/* Mostrar link/QR solo si hay url */}
            {urlPago && (
              <>
                <p className="text-sm text-white mb-2">Link generado:</p>
                <a
                  href={urlPago}
                  target="_blank"
                  className="block text-blue-300 underline mb-2 break-all"
                >
                  {urlPago}
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Hola! Este es el link para pagar tu pedido: ${urlPago}`
                  )}`}
                  target="_blank"
                  className="inline-block bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl"
                >
                  Enviar por WhatsApp
                </a>
              </>
            )}
          </div>
        )}

        <p className="text-right text-lg font-bold text-cyan-300 mb-4">
          Total: ${total.toFixed(2)}
        </p>

        <button
          onClick={enviarPedido}
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
  );
}
