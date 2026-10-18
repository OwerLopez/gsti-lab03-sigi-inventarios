# Planificación del release y de los sprints

## Decisión: ¿cuántos sprints?

En la reunión de planificación (Parte 1 del laboratorio) el equipo estimó el backlog del Release 1 en **67 SP**. Con una capacidad estimada de **22–25 SP por sprint** (3 integrantes, 1 semana simulada por sprint, factor de enfoque 0,7), el equipo decidió:

| Concepto | Valor |
|---|---|
| Duración del sprint | 1 semana simulada (≈ 2 h 30 min de laboratorio; cada día simulado ≈ 30 min) |
| Número de sprints del Release 1 | **3** (67 SP / 23 SP por sprint ≈ 2,9) |
| Margen | El cambio de requisitos HU-11 (3 SP) se absorbió sin agregar un cuarto sprint |
| Release | Release 1 publicado al cierre del Sprint 3 en GitHub Pages |

## Eventos y tiempos (time-box)

| Evento | Duración real en el laboratorio | Participantes |
|---|---|---|
| Sprint Planning | 30 min | Equipo Scrum completo |
| Daily Scrum | 5 min cada 30 min (1 por día simulado) | Developers + SM |
| Sprint Review | 15 min | Equipo + interesado (dueño de la tienda, rol asumido por el docente / equipo Cascada) |
| Sprint Retrospective | 10 min | Equipo Scrum |

## Sprint 1 · Control de stock

**Objetivo del sprint:** *Que la tienda pueda registrar su catálogo y controlar el stock con trazabilidad.*

| ID | Tarea técnica | Responsable | Est. (h) |
|---|---|---|---|
| TS-01 | Crear repositorio, ramas protegidas, workflow de CI y GitHub Pages | Ower López | 2 |
| HU-01 | Modelo de producto y validaciones (SKU único, precio ≥ costo) | Mauricio Zegarra | 3 |
| HU-01 | Formulario de alta de producto | Mauricio Zegarra | 2 |
| HU-02 | Edición y activación/desactivación | Mauricio Zegarra | 2 |
| HU-03 | Búsqueda y filtros por categoría / stock bajo | Ower López | 1 |
| HU-04 | Ingreso de mercadería con costo promedio ponderado | Ower López | 3 |
| HU-05 | Cálculo de alertas y cantidad sugerida | Cristian Saya (criterios) / Ower López | 2 |
| HU-06 | Kardex por producto con saldo acumulado | Mauricio Zegarra | 2 |
| HU-19 | Ajuste por inventario físico | — | 2 |
| Todas | Pruebas de aceptación (node:test) | Cristian Saya | 2 |

Compromiso: **26 SP**. Resultado: **23 SP** (HU-19 no se terminó y volvió al Product Backlog).

## Sprint 2 · Registro de ventas

**Objetivo del sprint:** *Que el cajero registre ventas que descuenten el stock automáticamente y cuadre la caja por método de pago.*

| ID | Tarea técnica | Responsable | Est. (h) |
|---|---|---|---|
| HU-07 | Carrito, cálculo de IGV incluido, vuelto y correlativo B001 | Mauricio Zegarra | 4 |
| HU-08 | Validación transaccional de stock (todo o nada) | Ower López | 2 |
| HU-09 | Anulación con devolución al stock | Ower López | 2 |
| HU-10 | Boleta imprimible | Mauricio Zegarra | 2 |
| HU-11 | Métodos de pago Efectivo / Tarjeta / Yape / Plin **(cambio)** | Mauricio Zegarra | 2 |
| HU-12 | Historial con filtros | Ower López | 1 |
| HU-19 | Ajuste por inventario físico (arrastre del Sprint 1) | Ower López | 2 |
| Todas | Pruebas de aceptación y revisión de PR | Cristian Saya | 2 |

Compromiso: **25 SP**. Resultado: **25 SP**.

## Sprint 3 · Reportes

**Objetivo del sprint:** *Que el dueño tome decisiones con reportes confiables y exportables.*

| ID | Tarea técnica | Responsable | Est. (h) |
|---|---|---|---|
| HU-13 | Panel principal con KPIs y gráficos (Chart.js) | Mauricio Zegarra | 3 |
| HU-14 | Ventas por día en un rango | Ower López | 2 |
| HU-15 | Ranking de productos más vendidos y margen | Ower López | 2 |
| HU-16 | Inventario valorizado y lista de reposición | Mauricio Zegarra | 2 |
| HU-17 | Exportar CSV e imprimir/PDF | Ower López | 1 |
| HU-18 | Respaldo y restauración JSON | Mauricio Zegarra | 2 |
| TS-02 | Suite de pruebas por sprint y datos de demostración | Cristian Saya | 2 |

Compromiso: **22 SP**. Resultado: **22 SP**.

## Velocidad

| Sprint | Comprometido (SP) | Completado (SP) |
|---|---|---|
| 1 | 26 | 23 |
| 2 | 25 | 25 |
| 3 | 22 | 22 |
| **Promedio** | 24,3 | **23,3** |
