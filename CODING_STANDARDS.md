# Normas de Codificación — Estándar de Calidad de Código

> **Estado:** Vigente
> **Versión:** 1.0
> **Aplica a:** Todo el código de este proyecto y cualquier proyecto nuevo del equipo
> **Idioma del documento:** Español
> **Idioma del código:** Español (identificadores, comentarios, mensajes de commit)

---

## 1. Objeto y Alcance

### 1.1 Propósito
Establecer reglas universales de calidad de código aplicables a **cualquier lenguaje y proyecto**, con un anexo de diagnóstico y remediación específico para el proyecto actual (`expreso-santa-cruz`).

### 1.2 Cómo usar este documento
- **[OBLIGATORIO]:** Incumplir bloquea el merge a `main`.
- **[RECOMENDADO]:** Mejora la calidad; su omisión debe justificarse en la descripción del PR.
- **[REFERENCIA]:** Contexto o explicación, no regla ejecutable.

### 1.3 Audiencia
Desarrolladores, revisores (reviewers), tech leads y herramientas automatizadas (linters, CI).

---

## 2. Referencias Normativas

| Norma | Aplicación en este documento |
|-------|------------------------------|
| **ISO/IEC 25010** (Calidad de producto software) | Atributos de calidad medibles: mantenibilidad, confiabilidad, seguridad, eficiencia, usabilidad, compatibilidad |
| **ISO/IEC 27001** (Seguridad de la información) | Gestión de secretos, mínimo privilegio, validación de datos, transporte cifrado |
| **ISO 9001** (Gestión de calidad) | Documentación, trazabilidad, mejora continua, Definition of Done |
| **ISO/IEC/IEEE 29119** (Pruebas de software) | Niveles de prueba, cobertura mínima, trazabilidad requisito → prueba |
| **ISO/IEC/IEEE 12207** (Ciclo de vida del software) | Procesos de desarrollo, revisión y mantenimiento |
| **Clean Code** — Robert C. Martin | Nombres, funciones, comentarios, estructura |
| **SOLID, DRY, KISS, YAGNI** | Principios de diseño |

---

## 3. Principios Rectores

| Principio | Regla práctica |
|-----------|----------------|
| **DRY** (Don't Repeat Yourself) | Toda pieza de conocimiento debe tener una única representación. Ver §5. |
| **KISS** (Keep It Simple, Stupid) | La solución simple es la preferida. No añadir capas innecesarias. |
| **YAGNI** (You Aren't Gonna Need It) | No implementar funcionalidad hasta que se necesite. |
| **SOLID** | S: una responsabilidad por módulo · O: abierto a extensión, cerrado a modificación · L: subtipos sustituibles · I: interfaces pequeñas y específicas · D: depender de abstracciones |
| **Regla del explorador** | Deja el código más limpio de lo que lo encontraste (sin refactorings masivos en PRs ajenos). |
| **Bajo acoplamiento / Alta cohesión** | Los módulos dependen de abstracciones, no de detalles internos. |

---

## 4. Clean Code — Reglas Universales

### 4.1 Nombres
- **[OBLIGATORIO]** Un solo idioma por proyecto (aquí: español). No mezclar `strFecha` con `apiRequest`.
- **[OBLIGATORIO]** Nombres que revelen intención: `calcularTotalEncomienda` > `calcular` > `c1`.
- **[OBLIGATORIO]** Sin abreviaturas salvo estándar del dominio (`HTTP`, `URL`, `ID`).
- **[OBLIGATORIO]** Sin prefijos de tipo (`strFecha`, `arrItems`) — el lenguaje ya declara el tipo.
- **[OBLIGATORIO]** Nombres de funciones = verbo + sustantivo (`obtenerDestinos`, `guardarEncomienda`).
- **[OBLIGATORIO]** Nombres de booleanos con prefijo `es`/`tiene`/`debe` (`esValido`, `tieneTramos`).
- **[OBLIGATORIO]** Constantes en `MAYÚSCULAS_CON_GUIONES` (`ESTADOS_PAGO`, `MAX_LENGTH`).

### 4.2 Funciones
- **[OBLIGATORIO]** Máximo **30 líneas** (sin contar líneas vacías y comentarios).
- **[OBLIGATORIO]** Máximo **3 parámetros**. Más de 3 → objeto de parámetros.
- **[OBLIGATORIO]** Un solo nivel de abstracción por función.
- **[OBLIGATORIO]** Una función = una cosa (Principio de Responsabilidad Única).
- **[OBLIGATORIO]** Efectos secundarios explícitos y aislados (no mezclar cálculo con escritura a BD).
- **[RECOMENDADO]** Funciones puras cuando sea posible: misma entrada → misma salida, sin efectos externos.
- **[OBLIGATORIO]** No usar flags como parámetros (`guardar(datos, true)`) — dividir en dos funciones.

### 4.3 Comentarios
- **[OBLIGATORIO]** El mejor comentario es el código que no lo necesita. Antes de comentar, refactoriza.
- **[OBLIGATORIO]** JSDoc/TSDoc solo en APIs públicas (funciones exportadas de módulos compartidos).
- **[OBLIGATORIO]** `TODO` siempre con responsable y fecha: `// TODO(usuario, 2026-10-08): descripción`.
- **[OBLIGATORIO]** Nada de código comentado. Se borra. La historia vive en git.
- **[RECOMENDADO]** Comentarios de "por qué", no de "qué": `// Se redondea a 2 decimales porque el banco lo exige`.

### 4.4 Estructura y formato
- **[OBLIGATORIO]** Anidamiento máximo de **3 niveles**. Más → extraer función o usar early returns.
- **[OBLIGATORIO]** Archivos de máximo **500 líneas**. Más → dividir por responsabilidad.
- **[OBLIGATORIO]** Formato automático con Prettier (o equivalente) + `.editorconfig` en la raíz.
- **[OBLIGATORIO]** Un componente/función por archivo. Un solo export principal por archivo.
- **[OBLIGATORIO]** Imports agrupados: externos → internos → relativos. Sin imports sin usar.

### 4.5 Manejo de errores
- **[OBLIGATORIO]** No devolver `null` silenciosamente. Lanzar excepción o devolver resultado tipado (`Result<T, E>`).
- **[OBLIGATORIO]** Mensajes de error accionables: qué pasó y qué hacer. No `"Error 500"`.
- **[OBLIGATORIO]** `try/catch` solo donde se puede manejar el error. No capturar y olvidar.
- **[OBLIGATORIO]** `JSON.parse` siempre dentro de `try/catch` (ej. `localStorage`).
- **[OBLIGATORIO]** Logging con niveles (`debug`, `info`, `warn`, `error`). Nunca loguear secretos ni datos personales.
- **[OBLIGATORIO]** Los errores de red deben distinguir: error de red, error HTTP, error de parseo.

### 4.6 Números y strings mágicos
- **[OBLIGATORIO]** Todo valor con significado de negocio es una constante con nombre.
- **[OBLIGATORIO]** Nada de `if (estado === 3)` → `if (estado === ESTADOS_PAGO.POR_PAGAR)`.

---

## 5. DRY — Reglas Concretas

### 5.1 Regla del 3
- 1ª vez: escribe el código.
- 2ª vez: nota la duplicación, sigue adelante.
- 3ª vez: refactoriza a una abstracción compartida.

### 5.2 Detección de duplicados
- **[OBLIGATORIO]** Antes de crear una utilidad, buscar si ya existe (`grep`, "buscar referencias").
- **[OBLIGATORIO]** Componentes con >80% de estructura similar → parametrizar o componer.
- **[OBLIGATORIO]** Constantes repetidas en varios archivos → módulo de constantes compartido.

### 5.3 Código muerto
- **[OBLIGATORIO]** Archivos no importados por nadie → borrar (verificar con grep antes).
- **[OBLIGATORIO]** Ramas `if` inalcanzables → borrar.
- **[OBLIGATORIO]** Parámetros opcionales nunca usados → borrar.
- **[OBLIGATORIO]** Comentarios de código → borrar (git es la historia).

### 5.4 Mapeo redundante
- **[OBLIGATORIO]** Si un servicio mapea campo a campo sin transformación (`{ a: data.a, b: data.b }`), evaluar pasar el objeto directamente o usar un mapper declarativo.

---

## 6. Seguridad — ISO 27001 Aplicada a Código

### 6.1 Secretos y credenciales
- **[OBLIGATORIO]** Ningún secreto en el código fuente. Solo en variables de entorno.
- **[OBLIGATORIO]** `.env` en `.gitignore`. `.env.example` con placeholders sí se commitea.
- **[OBLIGATORIO]** Variables de entorno de cliente con prefijo público (`VITE_` en Vite, `NEXT_PUBLIC_` en Next.js, etc.).
- **[OBLIGATORIO]** Validar en arranque que las variables requeridas existen (fail fast).
- **[OBLIGATORIO]** Rotar credenciales que hayan estado expuestas en git (aunque se borren después).
- **[OBLIGATORIO]** Nunca loguear tokens, claves o datos personales.

### 6.2 Autenticación y autorización
- **[OBLIGATORIO]** Contraseñas nunca en texto plano ni en query strings.
- **[OBLIGATORIO]** Usar el mecanismo de auth del proveedor (Supabase Auth, Auth0, etc.), no comparación manual de contraseñas.
- **[OBLIGATORIO]** Verificar permisos en el servidor, no solo en el cliente.
- **[OBLIGATORIO]** Tokens con expiración y refresh seguro.

### 6.3 Validación y sanitización
- **[OBLIGATORIO]** Validar todo input del cliente en el servidor (el cliente se puede bypasear).
- **[OBLIGATORIO]** Sanitizar datos antes de renderizar (XSS). En React, `{}` ya escapa; cuidado con `dangerouslySetInnerHTML`.
- **[OBLIGATORIO]** Parametrizar consultas (nunca concatenar SQL/URLs con input del usuario).
- **[OBLIGATORIO]** Límites de longitud y formato en inputs (ej. `MAX_LENGTH`).

### 6.4 Datos personales
- **[OBLIGATORIO]** Minimizar datos personales almacenados (LOPD/GDPR si aplica).
- **[OBLIGATORIO]** No guardar datos de sesión sensibles en `localStorage` (preferir `sessionStorage` o cookies `httpOnly`).
- **[OBLIGATORIO]** Cifrado en tránsito (HTTPS) obligatorio en producción.

---

## 7. Calidad ISO 25010 → Checklist Práctica

| Atributo | Regla práctica |
|----------|----------------|
| **Mantenibilidad** | Funciones ≤30 líneas, archivos ≤500 líneas, sin código muerto, tests |
| **Confiabilidad** | Manejo de errores sin `null` silencioso, `try/catch` en `JSON.parse`, timeouts en red |
| **Seguridad** | Secretos en `.env`, validación server-side, sin contraseñas en query strings |
| **Eficiencia** | Evitar re-renders innecesarios, paginación en listas, cache con TTL |
| **Usabilidad** | Mensajes de error en lenguaje de usuario, estados de carga/éxito/error |
| **Compatibilidad** | Navegadores soportados definidos, polyfills si aplica, responsive |
| **Funcionalidad** | Cada requisito tiene prueba (unitaria o e2e) |

---

## 8. Convenciones de Proyecto

### 8.1 Estructura de carpetas
```
src/
├── components/          # Componentes UI compartidos (sin lógica de negocio)
├── modules/             # Módulos de dominio
│   └── {modulo}/
│       ├── components/  # Componentes del módulo
│       ├── pages/       # Pantallas del módulo
│       └── services/    # Acceso a datos del módulo
├── utils/               # Utilidades puras (sin dependencias de UI)
├── styles/              # Estilos globales
└── config/              # Configuración y acceso a env
```

### 8.2 Naming por capa
| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Componente React | `PascalCase.jsx` | `EncomiendaForm.jsx` |
| Servicio | `camelCase.js` | `encomiendasService.js` |
| Utilidad | `camelCase.js` | `validators.js` |
| Constantes | `MAYÚSCULAS` | `ESTADOS_PAGO` |
| CSS | `kebab-case` | `.encomienda-form` |
| Archivo de test | `*.test.js` / `*.spec.js` | `validators.test.js` |

### 8.3 Separación de capas
- **[OBLIGATORIO]** Componentes no conocen la API directamente → usan servicios.
- **[OBLIGATORIO]** Servicios no conocen React → devuelven datos, no JSX.
- **[OBLIGATORIO]** Utilidades son puras → sin `fetch`, sin `localStorage`, sin React.

### 8.4 Formato y herramientas
- **[OBLIGATORIO]** Prettier + ESLint (o equivalente) en el proyecto.
- **[OBLIGATORIO]** `.editorconfig` en raíz (indentación, fin de línea, charset).
- **[OBLIGATORIO]** Lint pasa en CI antes de mergear.

---

## 9. Versionado y Commits

### 9.1 Conventional Commits
```
<tipo>(<alcance>): <descripción en español>

[opcional cuerpo]
[opcional pie]
```

| Tipo | Uso |
|------|-----|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `refactor` | Refactor sin cambio de comportamiento |
| `docs` | Documentación |
| `test` | Añadir o corregir tests |
| `chore` | Build, dependencias, CI |
| `style` | Formato (no afecta código) |
| `perf` | Mejora de rendimiento |
| `security` | Corrección de seguridad |

**Ejemplo:**
```
feat(encomiendas): agregar formulario de envío con tramos
```

### 9.2 Ramas
- `main` — producción, protegida.
- `develop` — integración (si aplica).
- `feat/*`, `fix/*`, `chore/*` — ramas de trabajo desde `main`.

### 9.3 Pull Requests
- **[OBLIGATORIO]** Título en español, descriptivo.
- **[OBLIGATORIO]** Descripción: qué, por qué, cómo se probó.
- **[OBLIGATORIO]** Checklist de code review (§10) completado por el autor.
- **[OBLIGATORIO]** 1 aprobación mínima para mergear.
- **[OBLIGATORIO]** CI verde (lint + build + tests).

---

## 10. Checklist de Code Review

### Antes de pedir revisión (autor)
- [ ] Lint pasa sin errores
- [ ] Build compila sin warnings
- [ ] Tests pasan (si aplica)
- [ ] Sin `console.log` de debug
- [ ] Sin código comentado
- [ ] Sin archivos temporales o de prueba
- [ ] Nombres en español y consistentes
- [ ] Funciones ≤30 líneas, archivos ≤500 líneas
- [ ] Sin secretos hardcodeados
- [ ] Manejo de errores en llamadas async
- [ ] `JSON.parse` con `try/catch`

### Durante la revisión (reviewer)
- [ ] ¿El código hace lo que dice el PR?
- [ ] ¿Hay tests para la nueva funcionalidad?
- [ ] ¿Se pueden introducir bugs con edge cases?
- [ ] ¿Hay código muerto o duplicado?
- [ ] ¿Los nombres son claros?
- [ ] ¿El manejo de errores es correcto?
- [ ] ¿Hay problemas de seguridad?
- [ ] ¿El rendimiento es aceptable?

---

## 11. Checklists Operativas

### 11.1 Pre-commit
```bash
npm run lint
npm run build
```

### 11.2 Pre-PR
- [ ] Checklist de code review (§10) completado
- [ ] Rama actualizada con `main`
- [ ] Commits con Conventional Commits
- [ ] Sin commits de "wip", "fix", "cambios"

### 11.3 Pre-release
- [ ] Tests e2e pasan
- [ ] Variables de entorno de producción configuradas
- [ ] Secretos rotados si hubo exposición
- [ ] `dist/` no commiteado
- [ ] README actualizado
- [ ] CHANGELOG actualizado (si aplica)

---

## 12. Métricas Automatizables

| Métrica | Herramienta | Umbral |
|---------|-------------|--------|
| Lint | ESLint / oxlint | 0 errores |
| Formato | Prettier | Sin diff |
| Cobertura de tests | Jest / Vitest | ≥ 80% |
| Complejidad ciclomática | CodeClimate / SonarQube | ≤ 10 por función |
| Tamaño de función | Revisión manual | ≤ 30 líneas |
| Tamaño de archivo | Revisión manual | ≤ 500 líneas |
| Dependencias vulnerables | `npm audit` | 0 críticas |

---

## 13. Deuda Técnica

### 13.1 Registro
- Toda deuda técnica se registra en el issue tracker con etiqueta `deuda-tecnica`.
- Formato: `[DEUDA] <descripción> — Impacto: <alto/medio/bajo> — Esfuerzo: <S/M/L>`.

### 13.2 Presupuesto
- Máximo **20%** de cada sprint se dedica a pagar deuda técnica.
- Deuda de seguridad se atiende de inmediato, sin esperar sprint.

### 13.3 Definition of Done
- [ ] Código escrito y formateado
- [ ] Tests pasan
- [ ] Lint pasa
- [ ] Code review aprobado
- [ ] Documentación actualizada (si aplica)
- [ ] Sin deuda técnica nueva sin registrar

---

## 14. Anexo A — Diagnóstico de este Proyecto

### 14.1 Hallazgos y remediación

| # | Hallazgo | Norma violada | Estado |
|---|----------|---------------|--------|
| 1 | Credenciales Supabase hardcodeadas en `encomiendasService.js` | §6.1 | ✅ Corregido — ahora usa `import.meta.env.VITE_*` |
| 2 | `.env` no estaba en `.gitignore` | §6.1 | ✅ Corregido |
| 3 | Código muerto: `src/components/EncomiendaForm.jsx`, `Historial.jsx`, `data/mockData.js`, `App.css` | §5.3 | ✅ Corregido — eliminados |
| 4 | Mezcla de idiomas en identificadores (`strFecha`, `hardFilter`, `apiRequest`) | §4.1 | ⏳ Pendiente de refactor |
| 5 | `validators.js` mezcla filtros de teclado con utilidades de fechas | §4.2 (SRP) | ⏳ Pendiente de división |
| 6 | `JSON.parse(localStorage)` sin `try/catch` en `App.jsx` | §4.5 | ⏳ Pendiente |
| 7 | Login con contraseña en query string | §6.2 | ⏳ Deuda técnica — requiere migrar a Supabase Auth |
| 8 | Sin tests automatizados | §12 | ⏳ Pendiente |
| 9 | Sin Prettier / `.editorconfig` | §8.4 | ⏳ Pendiente |
| 10 | README sin configurar (sigue plantilla Vite) | §11.3 | ⏳ Pendiente |
| 11 | `dist/` y `.zip` en el repositorio | §11.3 | ⏳ Pendiente |

### 14.2 Prioridad de remediación
1. **Crítica (hecha):** Credenciales, `.gitignore`, código muerto.
2. **Alta:** Migrar login a Supabase Auth, `try/catch` en `JSON.parse`.
3. **Media:** Prettier + `.editorconfig`, README, dividir `validators.js`.
4. **Baja:** Tests automatizados, limpieza de `dist/` y `.zip`.

---

## 15. Anexo B — Plantilla en Blanco para Nuevos Proyectos

```markdown
# Normas de Codificación — [Nombre del Proyecto]

> **Estado:** Vigente
> **Versión:** 1.0
> **Idioma del código:** [Español/Inglés]

## 1. Principios
- DRY, KISS, YAGNI, SOLID

## 2. Nombres
- Idioma: [definir]
- Funciones: verbo + sustantivo
- Constantes: MAYÚSCULAS

## 3. Funciones
- ≤30 líneas, ≤3 parámetros, una responsabilidad

## 4. Seguridad
- Secretos en .env
- Validación server-side
- Sin datos sensibles en localStorage

## 5. Commits
- Conventional Commits en [español/inglés]

## 6. Definition of Done
- [ ] Tests pasan
- [ ] Lint pasa
- [ ] Code review aprobado
```

---

**Fin del documento.**
