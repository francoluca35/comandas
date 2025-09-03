# 🖨️ Comandos de Verificación del Servidor de Impresión

## 📍 Desde tu PC (para verificar el servidor del cliente)

### 1. **Verificar Versión del Servidor**
```bash
# Verificar que se actualizó correctamente
curl http://IP-DEL-CLIENTE:4000/version

# Ejemplo:
curl http://192.168.1.50:4000/version
```

**Respuesta esperada:**
```json
{
  "version": "1.2.0",
  "fecha": "2024-01-XX...",
  "cambios": [
    "✅ Precio visible en tickets 'Para Llevar'",
    "✅ Lógica corregida para detección de 'Para Llevar'",
    "✅ Total extraído correctamente del req.body",
    "✅ Tickets duplicados para brasas (parrilla + cocina)",
    "✅ Tickets duplicados para no-brasas (2x cocina)"
  ],
  "servidor": "impresora-local.js",
  "puerto": 4000,
  "impresoras": {
    "cocina": "192.168.1.100",
    "parrilla": "192.168.1.101"
  }
}
```

### 2. **Verificar Estado del Servidor**
```bash
# Estado básico del servidor
curl http://IP-DEL-CLIENTE:4000/status

# Ejemplo:
curl http://192.168.1.50:4000/status
```

**Respuesta esperada:**
```json
{
  "status": "running",
  "timestamp": "2024-01-XX...",
  "impresoras": {
    "cocina": "192.168.1.100",
    "parrilla": "192.168.1.101",
    "puerto": 9100
  }
}
```

### 3. **Verificar Estado de las Impresoras**
```bash
# Verificar conectividad con las impresoras físicas
curl http://IP-DEL-CLIENTE:4000/check-printers

# Ejemplo:
curl http://192.168.1.50:4000/check-printers
```

**Respuesta esperada:**
```json
{
  "timestamp": "2024-01-XX...",
  "estado": "Verificación completada",
  "impresoras": {
    "cocina": {
      "ip": "192.168.1.100",
      "estado": "✅ CONECTADA",
      "puerto": 9100
    },
    "parrilla": {
      "ip": "192.168.1.101",
      "estado": "✅ CONECTADA",
      "puerto": 9100
    }
  }
}
```

### 4. **Debug Completo del Servidor**
```bash
# Información técnica completa del servidor
curl http://IP-DEL-CLIENTE:4000/debug

# Ejemplo:
curl http://192.168.1.50:4000/debug
```

**Respuesta esperada:**
```json
{
  "timestamp": "2024-01-XX...",
  "uptime": 12345.67,
  "memoria": { ... },
  "version": "v18.x.x",
  "plataforma": "win32",
  "configuracion": {
    "puerto": 4000,
    "ip_cocina": "192.168.1.100",
    "ip_parrilla": "192.168.1.101",
    "puerto_impresora": 9100
  },
  "funciones_disponibles": [
    "generarTicketCocina",
    "generarTicketDelivery",
    "generarTicketParaLlevar",
    "imprimirTicket"
  ]
}
```

## 🧪 **Comandos de Prueba (Windows PowerShell)**

### **Verificar desde PowerShell:**
```powershell
# Verificar versión
Invoke-RestMethod -Uri "http://IP-DEL-CLIENTE:4000/version"

# Verificar estado
Invoke-RestMethod -Uri "http://IP-DEL-CLIENTE:4000/status"

# Verificar impresoras
Invoke-RestMethod -Uri "http://IP-DEL-CLIENTE:4000/check-printers"
```

### **Verificar desde navegador web:**
```
http://IP-DEL-CLIENTE:4000/version
http://IP-DEL-CLIENTE:4000/status
http://IP-DEL-CLIENTE:4000/check-printers
http://IP-DEL-CLIENTE:4000/debug
```

## 🔍 **Verificación de Funcionalidad**

### **Si la versión es 1.2.0 o superior:**
✅ **Servidor actualizado correctamente**
✅ **Precio visible en tickets 'Para Llevar'**
✅ **Lógica corregida para detección de 'Para Llevar'**
✅ **Total extraído correctamente del req.body**

### **Si las impresoras están conectadas:**
✅ **Impresora de Cocina (192.168.1.100) - Funcionando**
✅ **Impresora de Parrilla (192.168.1.101) - Funcionando**

## 📝 **Notas Importantes**

- **Puerto del servidor**: 4000
- **Puerto de impresoras**: 9100
- **IPs de impresoras**: Configuradas en el servidor
- **Timeout de verificación**: 3 segundos por impresora

## 🚨 **Solución de Problemas**

### **Si no responde:**
1. Verificar que el servidor esté corriendo en el cliente
2. Verificar firewall del cliente
3. Verificar que el puerto 4000 esté abierto
4. Verificar conectividad de red

### **Si impresoras desconectadas:**
1. Verificar cables de red
2. Verificar IPs de las impresoras
3. Verificar que las impresoras estén encendidas
4. Verificar configuración de red
