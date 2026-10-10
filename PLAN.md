# Plan: PWA Expreso Santa Cruz

## Paso 1: Instalar Prerrequisitos

### 1.1 Node.js LTS
- Descargar de: https://nodejs.org
- Instalar versión LTS (recomendado)
- Verificar instalación:
```bash
node --version
npm --version
```

### 1.2 VS Code (opcional pero recomendado)
- Descargar de: https://code.visualstudio.com
- Extensiones útiles:
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter

---

## Paso 2: Crear Proyecto

```bash
npm create vite@latest expreso-santa-cruz -- --template react
cd expreso-santa-cruz
npm install
```

---

## Paso 3: Instalar PWA Plugin

```bash
npm install -D vite-plugin-pwa
```

---

## Paso 4: Configurar PWA

### 4.1 Crear `public/manifest.json`
```json
{
  "name": "Expreso Santa Cruz",
  "short_name": "ExpresoSC",
  "description": "App de Expreso Santa Cruz",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 4.2 Crear iconos
- Crear `public/icon-192.png` (192x192 píxeles)
- Crear `public/icon-512.png` (512x512 píxeles)
- Puedes usar https://www.pwabuilder.com/imageGenerator para generarlos

### 4.3 Configurar `vite.config.js`
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Expreso Santa Cruz',
        short_name: 'ExpresoSC',
        description: 'App de Expreso Santa Cruz',
        theme_color: '#ffffff',
        background_color: '#000000',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
```

---

## Paso 5: Desarrollo Local

```bash
npm run dev
```

- Abrir en PC: `http://localhost:5173`
- Abrir en celular (misma red WiFi): `http://[IP-PC]:5173`
  - Para ver tu IP: `ipconfig` en Windows

---

## Paso 6: Build de Producción

```bash
npm run build
```

Esto genera la carpeta `dist/` con los archivos listos para producción.

---

## Paso 7: Deploy Gratuito

### Opción A: Vercel (Recomendado)
1. Ir a https://vercel.com
2. Crear cuenta con GitHub
3. Subir el repositorio GitHub del proyecto
4. Vercel detecta Vite automáticamente

### Opción B: Netlify Drop (Más rápido)
1. Ir a https://app.netlify.com/drop
2. Arrastrar la carpeta `dist` a la página
3. Listo, tienes URL gratuita

### Opción C: GitHub Pages
1. Crear repositorio en GitHub
2. Subir el código
3. Instalar: `npm install -D gh-pages`
4. Agregar a `package.json`:
```json
"scripts": {
  "deploy": "gh-pages -d dist"
}
```
5. Ejecutar: `npm run build && npm run deploy`

---

## Paso 8: Instalar en el Celular

1. Abrir la URL en el navegador del teléfono
2. Menú (tres puntos) → **"Añadir a pantalla de inicio"**
3. La app aparece como icono normal
4. Se abre como app nativa (sin barra de navegador)

---

## Estructura del Proyecto

```
expreso-santa-cruz/
├── public/
│   ├── manifest.json
│   ├── icon-192.png
│   └── icon-512.png
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
└── vite.config.js
```

---

## Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build localmente |

---

## Costos

| Concepto | Costo |
|----------|-------|
| Desarrollo | $0 |
| Hosting (Vercel/Netlify) | $0 |
| Dominio (opcional) | ~$10-15/año |
| **Total mínimo** | **$0** |

---