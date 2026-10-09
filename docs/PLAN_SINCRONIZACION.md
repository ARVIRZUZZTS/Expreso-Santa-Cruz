# Plan: Sincronización y Auto-eliminación de Encomiendas

## Objetivo

Mantener la base de datos limpia eliminando encomiendas después de 1 mes, usando la PC de la sucursal como servidor de sincronización con doble flujo (descarga diaria + retroactiva).

---

## 1. Esquema de Base de Datos

### Tabla: `encomiendas_mobile`

```sql
CREATE TABLE IF NOT EXISTS encomiendas_mobile (
    id SERIAL PRIMARY KEY,
    remitente VARCHAR(50) NOT NULL,
    remtelf VARCHAR(10) NOT NULL,
    consignatario VARCHAR(50) NOT NULL,
    contelf VARCHAR(10) NOT NULL,
    primer_tramo INT NOT NULL DEFAULT 0,
    segundo_tramo INT NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    bulto VARCHAR(255),
    valdeclarado VARCHAR(10) DEFAULT 'No',
    destino VARCHAR(100) NOT NULL,
    sucursal INT NOT NULL,
    estadopaga INT DEFAULT 1,
    fecha DATE DEFAULT CURRENT_DATE,
    sincronizado BOOLEAN DEFAULT FALSE,
    registrador VARCHAR(50) NOT NULL,
    tipo_pago VARCHAR(10) DEFAULT 'efectivo',
    pc_id VARCHAR(20) DEFAULT NULL,
    fecha_sincronizacion TIMESTAMP DEFAULT NULL
);

CREATE INDEX idx_em_sucursal ON encomiendas_mobile(sucursal);
CREATE INDEX idx_em_sincronizado ON encomiendas_mobile(sincronizado);
CREATE INDEX idx_em_fecha ON encomiendas_mobile(fecha);
CREATE INDEX idx_em_pc_id ON encomiendas_mobile(pc_id);
```

### Tabla: `usuarios`

```sql
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    tipo_empleado VARCHAR(20) NOT NULL,
    estado VARCHAR(10) DEFAULT 'activo',
    sucursal INT NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_sucursal ON usuarios(sucursal);
CREATE INDEX idx_usuarios_estado ON usuarios(estado);
```

### Tabla: `encomiendas_local` (NUEVA - copia local en PC sucursal)

```sql
CREATE TABLE IF NOT EXISTS encomiendas_local (
    id SERIAL PRIMARY KEY,
    encomienda_id INT NOT NULL,
    remitente VARCHAR(50) NOT NULL,
    remtelf VARCHAR(10) NOT NULL,
    consignatario VARCHAR(50) NOT NULL,
    contelf VARCHAR(10) NOT NULL,
    primer_tramo INT NOT NULL DEFAULT 0,
    segundo_tramo INT NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    bulto VARCHAR(255),
    valdeclarado VARCHAR(10) DEFAULT 'No',
    destino VARCHAR(100) NOT NULL,
    sucursal INT NOT NULL,
    estadopaga INT DEFAULT 1,
    fecha DATE DEFAULT CURRENT_DATE,
    registrador VARCHAR(50) NOT NULL,
    tipo_pago VARCHAR(10) DEFAULT 'efectivo',
    pc_id VARCHAR(20) NOT NULL,
    fecha_sincronizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days')
);

CREATE INDEX idx_el_encomienda ON encomiendas_local(encomienda_id);
CREATE INDEX idx_el_fecha ON encomiendas_local(fecha);
CREATE INDEX idx_el_expiracion ON encomiendas_local(fecha_expiracion);
```

---

## 2. Flujo de Sincronización

### Flujo A: Descarga Diaria (encomiendas del día)

```
App Móvil                    Supabase                    PC Sucursal
    │                          │                          │
    │  1. Subir encomienda     │                          │
    │  (sincronizado=false)    │                          │
    │─────────────────────────>│                          │
    │                          │                          │
    │                          │  2. Consultar encomiendas │
    │                          │     del día actual        │
    │                          │     (sincronizado=false)  │
    │                          │<─────────────────────────│
    │                          │                          │
    │                          │  3. Retornar datos        │
    │                          │─────────────────────────>│
    │                          │                          │
    │                          │  4. Marcar sincronizada   │
    │                          │     + asignar pc_id       │
    │                          │     + fecha_sincronizacion│
    │                          │<─────────────────────────│
    │                          │                          │
    │                          │  5. Guardar en local      │
    │                          │     (encomiendas_local)   │
    │                          │                          │
```

### Flujo B: Descarga Retroactiva (no sincronizadas de días anteriores)

```
App Móvil                    Supabase                    PC Sucursal
    │                          │                          │
    │                          │  6. Consultar no          │
    │                          │     sincronizadas         │
    │                          │     (fecha < hoy)         │
    │                          │<─────────────────────────│
    │                          │                          │
    │                          │  7. Retornar datos        │
    │                          │─────────────────────────>│
    │                          │                          │
    │                          │  8. Marcar sincronizada   │
    │                          │     + asignar pc_id       │
    │                          │<─────────────────────────│
    │                          │                          │
    │                          │  9. Guardar en local      │
    │                          │                          │
```

### Flujo C: Eliminación automática

```
Supabase                    PC Sucursal
    │                          │
    │  10. Eliminar encomiendas │
    │      sincronizadas        │
    │      con fecha > 1 mes    │
    │<─────────────────────────│
    │                          │
    │                          │  11. Eliminar locales     │
    │                          │      con fecha_expiracion │
    │                          │      < hoy                │
    │                          │                          │
```

---

## 3. Script de Sincronización (PC Sucursal)

### PHP: `sincronizar.php`

```php
<?php
header('Content-Type: application/json');

$SUPABASE_URL = 'https://mxonuyelhoxenasrtvpf.supabase.co/rest/v1';
$SUPABASE_KEY = 'tu_api_key_aqui';
$PC_ID = 'PC001'; // ID único de esta PC

// ============================================
// FASE 1: DESCARGA DIARIA (encomiendas del día)
// ============================================

$ch = curl_init("$SUPABASE_URL/encomiendas_mobile?sincronizado=eq.false&fecha=eq." . date('Y-m-d') . "&select=*");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "apikey: $SUPABASE_KEY",
    "Authorization: Bearer $SUPABASE_KEY"
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$encomiendasHoy = json_decode(curl_exec($ch), true);
curl_close($ch);

// Procesar encomiendas del día
foreach ($encomiendasHoy as $enc) {
    // Guardar en local
    guardarEnLocal($enc, $PC_ID);
    
    // Marcar como sincronizada
    $ch = curl_init("$SUPABASE_URL/encomiendas_mobile?id=eq.{$enc['id']}");
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "apikey: $SUPABASE_KEY",
        "Authorization: Bearer $SUPABASE_KEY",
        "Content-Type: application/json"
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'sincronizado' => true,
        'pc_id' => $PC_ID,
        'fecha_sincronizacion' => date('Y-m-d H:i:s')
    ]));
    curl_exec($ch);
    curl_close($ch);
}

// ============================================
// FASE 2: DESCARGA RETROACTIVA (no sincronizadas)
// ============================================

$ch = curl_init("$SUPABASE_URL/encomiendas_mobile?sincronizado=eq.false&fecha=lt." . date('Y-m-d') . "&select=*");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "apikey: $SUPABASE_KEY",
    "Authorization: Bearer $SUPABASE_KEY"
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$encomiendasViejas = json_decode(curl_exec($ch), true);
curl_close($ch);

// Procesar encomiendas viejas no sincronizadas
foreach ($encomiendasViejas as $enc) {
    guardarEnLocal($enc, $PC_ID);
    
    $ch = curl_init("$SUPABASE_URL/encomiendas_mobile?id=eq.{$enc['id']}");
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "apikey: $SUPABASE_KEY",
        "Authorization: Bearer $SUPABASE_KEY",
        "Content-Type: application/json"
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'sincronizado' => true,
        'pc_id' => $PC_ID,
        'fecha_sincronizacion' => date('Y-m-d H:i:s')
    ]));
    curl_exec($ch);
    curl_close($ch);
}

// ============================================
// FASE 3: ELIMINAR ANTIGUAS SINCRONIZADAS
// ============================================

$fechaLimite = date('Y-m-d', strtotime('-30 days'));

$ch = curl_init("$SUPABASE_URL/encomiendas_mobile?sincronizado=eq.true&fecha=lt.$fechaLimite");
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "apikey: $SUPABASE_KEY",
    "Authorization: Bearer $SUPABASE_KEY"
]);
curl_exec($ch);
curl_close($ch);

echo json_encode([
    'status' => 'ok',
    'descargadas_hoy' => count($encomiendasHoy),
    'descargadas_retroactivas' => count($encomiendasViejas),
    'eliminadas' => 0 // Supabase no retorna count de eliminados
]);

function guardarEnLocal($enc, $pcId) {
    // Lógica para guardar en base de datos local (MySQL/PostgreSQL)
    // o en archivo JSON/CSV según necesidad
}
?>
```

### Python: `sincronizar.py`

```python
import requests
from datetime import datetime, timedelta

SUPABASE_URL = 'https://mxonuyelhoxenasrtvpf.supabase.co/rest/v1'
SUPABASE_KEY = 'tu_api_key_aqui'
PC_ID = 'PC001'

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json'
}

# FASE 1: DESCARGA DIARIA
r = requests.get(
    f'{SUPABASE_URL}/encomiendas_mobile?sincronizado=eq.false&fecha=eq.{datetime.now().strftime("%Y-%m-%d")}',
    headers=headers
)
encomiendas_hoy = r.json()

for enc in encomiendas_hoy:
    guardar_en_local(enc, PC_ID)
    requests.patch(
        f'{SUPABASE_URL}/encomiendas_mobile?id=eq.{enc["id"]}',
        headers=headers,
        json={
            'sincronizado': True,
            'pc_id': PC_ID,
            'fecha_sincronizacion': datetime.now().isoformat()
        }
    )

# FASE 2: DESCARGA RETROACTIVA
r = requests.get(
    f'{SUPABASE_URL}/encomiendas_mobile?sincronizado=eq.false&fecha=lt.{datetime.now().strftime("%Y-%m-%d")}',
    headers=headers
)
encomiendas_viejas = r.json()

for enc in encomiendas_viejas:
    guardar_en_local(enc, PC_ID)
    requests.patch(
        f'{SUPABASE_URL}/encomiendas_mobile?id=eq.{enc["id"]}',
        headers=headers,
        json={
            'sincronizado': True,
            'pc_id': PC_ID,
            'fecha_sincronizacion': datetime.now().isoformat()
        }
    )

# FASE 3: ELIMINAR ANTIGUAS
fecha_limite = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
requests.delete(
    f'{SUPABASE_URL}/encomiendas_mobile?sincronizado=eq.true&fecha=lt.{fecha_limite}',
    headers=headers
)

print(f'Descargadas hoy: {len(encomiendas_hoy)}')
print(f'Descargadas retroactivas: {len(encomiendas_viejas)}')

def guardar_en_local(enc, pc_id):
    pass  # Implementar según necesidad
```

---

## 4. Interfaz `menu.html` (PC Sucursal)

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sincronización - Expreso Santa Cruz</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .btn {
            padding: 15px 30px;
            font-size: 18px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            margin: 10px;
        }
        .btn-primary { background: #83232e; color: white; }
        .btn-danger { background: #d32f2f; color: white; }
        .resultado {
            margin-top: 20px;
            padding: 15px;
            background: #f5f5f5;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <h1>Sincronización de Encomiendas</h1>
    <p>PC Sucursal Matriz</p>
    
    <button class="btn btn-primary" onclick="sincronizar()">
        Sincronizar Ahora
    </button>
    
    <button class="btn btn-danger" onclick="limpiar()">
        Limpiar Antiguas
    </button>
    
    <div id="resultado" class="resultado"></div>

    <script>
        async function sincronizar() {
            const res = await fetch('sincronizar.php');
            const data = await res.json();
            document.getElementById('resultado').innerHTML = `
                <strong>Estado:</strong> ${data.status}<br>
                <strong>Descargadas hoy:</strong> ${data.descargadas_hoy}<br>
                <strong>Descargadas retroactivas:</strong> ${data.descargadas_retroactivas}
            `;
        }
        
        async function limpiar() {
            const res = await fetch('limpiar.php');
            const data = await res.json();
            document.getElementById('resultado').innerHTML = `
                <strong>Estado:</strong> ${data.status}<br>
                <strong>Eliminadas:</strong> ${data.eliminadas}
            `;
        }
    </script>
</body>
</html>
```

---

## 5. Programación del Script

### Windows (Task Scheduler)
1. Crear tarea programada que ejecute el script cada hora
2. Comando: `php C:\xampp\htdocs\sincronizar.php`

### Linux (Cron)
```bash
crontab -e
# Cada hora
0 * * * * /usr/bin/php /var/www/html/sincronizar.php
```

---

## 6. Consideraciones

| Aspecto | Detalle |
|---------|---------|
| **Plan gratuito** | No usa pg_cron, todo desde la PC |
| **Frecuencia** | Recomendado: cada 1-2 horas |
| **Encomiendas sincronizadas** | Se eliminan después de 1 mes |
| **Encomiendas no sincronizadas** | Se eliminan después de 1 mes |
| **PC debe estar encendida** | El script solo corre cuando la PC está activa |
| **pc_id** | Código único por PC (ej: "PC001", "PC002") |
| **Seguridad** | Usar variables de entorno para API key |

---

## 7. Archivos a Crear

| Archivo | Ubicación | Descripción |
|---------|-----------|-------------|
| `sincronizar.php` | PC Sucursal | Script principal de sincronización |
| `limpiar.php` | PC Sucursal | Script para limpiar antiguas |
| `menu.html` | PC Sucursal | Interfaz web para ejecutar manualmente |
| `003_nuevas_columnas.sql` | Supabase | Migración para agregar pc_id, fecha_sincronizacion |
| `004_tabla_local.sql` | Supabase | Crear tabla encomiendas_local |

---

## 8. Próximos Pasos

1. [ ] Crear migración `003_nuevas_columnas.sql` en Supabase
2. [ ] Crear tabla `encomiendas_local` en Supabase
3. [ ] Crear script `sincronizar.php` en PC Sucursal
4. [ ] Crear `menu.html` con botones de sincronización
5. [ ] Programar tarea programada o cron
6. [ ] Probar flujo completo
