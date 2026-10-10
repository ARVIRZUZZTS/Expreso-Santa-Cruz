# Expreso Santa Cruz — PWA de Encomiendas

Aplicación web progresiva (PWA) móvil-first para el registro y la gestión de **encomiendas** (paquetería) de la empresa de transporte interdepartamental **Expreso Santa Cruz**.

Permite al operador de terminal iniciar sesión, registrar encomiendas con datos de remitente y consignatario, calcular tarifas por tramos, registrar el estado de pago y consultar el historial de envíos. Es instalable en el celular como una app nativa y funciona con backend **Supabase**.

## Funcionalidades

- **Inicio de sesión** de operador (usuario y contraseña contra la tabla `usuarios`).
- **Nueva encomienda**: datos del remitente y consignatario, destino (con tarifas por **tramos**), tipo de pago (efectivo/QR), bulto y valor declarado.
- **Estado de pago**: cancelado, por pagar, primer tramo, segundo tramo.
- **Historial de encomiendas** del registrador, con caché local de 5 minutos (funciona offline parcialmente).
- **Perfil** de usuario y cierre de sesión.
- **PWA instalable** con service worker (actualización automática).

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| UI | React 19 (`react`, `react-dom`) |
| Build | Vite 8 + `@vitejs/plugin-react` |
| PWA | `vite-plugin-pwa` (`registerType: 'autoUpdate'`) |
| Lint | oxlint |
| Backend | Supabase (PostgREST vía `fetch`, sin SDK) |
| Estilos | CSS puro con variables de tema |
| Lenguaje | JavaScript (JSX), ES Modules |

## Estructura del proyecto

```
expreso-santa-cruz/
├── public/                 # manifest.json, icono, imágenes de marca
├── src/
│   ├── App.jsx             # Vista raíz (navegación por estado, sin router)
│   ├── main.jsx            # Montaje de React + registro del service worker
│   ├── components/         # BottomNav, Login, Menu, Perfil
│   ├── modules/
│   │   └── encomiendas/
│   │       ├── components/ # EncomiendaForm, HistorialEncomiendas
│   │       └── services/   # encomiendasService, cacheService
│   ├── styles/             # variables, components, mobile
│   └── utils/              # validators, helpers de fecha
├── cochabamba-mobile/      # App hermana en vanilla JS (sucursal Cochabamba)
├── supabase/               # SQL: tablas, migraciones y seeder (ignorado en git)
├── docs/                   # Documentación (PLAN_SINCRONIZACION.md)
├── index.html
├── package.json
└── vite.config.js          # Configuración de Vite + PWA
```

## Primeros pasos

### Requisitos

- **Node.js LTS** (>= 20).

### Instalación

```bash
npm install
```

### Variables de entorno

Copia `.env.example` como `.env` y reemplaza los valores:

```bash
cp .env.example .env
```

| Variable | Uso |
|---|---|
| `VITE_SUPABASE_URL` | URL del API REST de Supabase (expuesta en el bundle) |
| `VITE_SUPABASE_KEY` | Anon key de Supabase (expuesta en el bundle) |
| `SUPABASE_URL` | Uso server-side / edge functions |
| `SUPABASE_KEY` | Uso server-side / edge functions |
| `SUPABASE_JWT_SECRET` | Uso server-side / edge functions |

> **NUNCA** subas `.env` al repositorio; solo se permite el archivo `.env.example`.

### Desarrollo

```bash
npm run dev
```

Abre `http://localhost:5173`. Para probar en el celular (misma red WiFi), usa `http://[IP-PC]:5173`.

### Base de datos

La app requiere el esquema de `supabase/`:

1. Ejecuta `supabase/destinos.sql` y `supabase/encomiendas_mobile.sql`.
2. Aplica las migraciones de `supabase/migrations/`.
3. Carga `supabase/seeder.sql` para los destinos y el usuario demo.

**Usuario demo:** `Juan Pérez` / `demo123`.

## Comandos

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Vista previa local del build |
| `npm run lint` | Análisis estático con oxlint |

## Deploy

1. **Build de producción:**

   ```bash
   npm run build
   ```

2. **Hospeda la carpeta `dist/`** en cualquier hosting estático:
   - **Vercel** (detecta Vite automáticamente), **Netlify Drop** o **GitHub Pages**.

3. **Instalar en el celular:** abre la URL en el navegador → menú (⋮) → **"Añadir a pantalla de inicio"**. La app se abre en modo standalone.

## App Cochabamba Móvil

`cochabamba-mobile/` es una **PWA independiente en JavaScript puro** (sin framework, sin bundler) para la sucursal de Cochabamba. Usa autenticación de Supabase y un esquema propio (`encomiendamovil`, `zonas`, `viajebodega`). No forma parte del build de React.

## Documentación

- `CODING_STANDARDS.md` — normas de codificación del proyecto (convenciones, arquitectura, seguridad).
- `PLAN.md` — guía paso a paso de creación y despliegue de la PWA.
- `docs/PLAN_SINCRONIZACION.md` — plan de sincronización y borrado automático de encomiendas.

## Contribución

Sigue las normas de `CODING_STANDARDS.md`: código y commits en español, Conventional Commits, y evita subir secretos. Antes de enviar código, valida con `npm run lint` y `npm run build`.