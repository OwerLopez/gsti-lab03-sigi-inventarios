# Product Backlog · SIGI Retail

**Product Owner:** Cristian Raúl Saya Vargas · **Scrum Master:** Ower Frank López Arela · **Developers:** Mauricio Eduardo Zegarra Puma, Ower Frank López Arela

**Visión del producto:** *Para* el dueño y los cajeros de un minimarket *que* hoy controlan el stock en cuadernos y hojas de cálculo, *SIGI Retail* es un sistema web de inventarios *que* mantiene el stock al día con cada venta y genera reportes para decidir qué reponer. *A diferencia* de un POS genérico, se enfoca en alertas de reposición y trazabilidad (kardex) con cero costo de licencias.

Escala de estimación: Planning Poker con serie de Fibonacci (1, 2, 3, 5, 8, 13). Priorización: MoSCoW + valor de negocio.

## Épicas

| Épica | Objetivo de negocio |
|---|---|
| E1 · Control de stock | Saber en todo momento cuánto hay de cada producto y qué falta reponer |
| E2 · Registro de ventas | Vender rápido y que cada venta descuente el stock sin intervención manual |
| E3 · Reportes | Tomar decisiones con datos: ventas, rotación, valor del inventario |
| E4 · Soporte técnico | Repositorio, integración continua, despliegue y calidad |

## Historias de usuario

| ID | Historia | Épica | Prioridad | SP | Sprint | Estado |
|---|---|---|---|---|---|---|
| TS-01 | Como equipo, quiero un repositorio con CI y despliegue en GitHub Pages para integrar y publicar en cada cambio | E4 | Must | 2 | 1 | Hecho |
| HU-01 | Como administrador, quiero registrar productos (código, nombre, categoría, costo, precio, stock mínimo) para tener el catálogo en el sistema | E1 | Must | 5 | 1 | Hecho |
| HU-02 | Como administrador, quiero editar y desactivar productos para mantener el catálogo actualizado sin perder historial | E1 | Must | 3 | 1 | Hecho |
| HU-03 | Como cajero, quiero buscar productos por nombre, código o categoría para encontrarlos rápido | E1 | Should | 2 | 1 | Hecho |
| HU-04 | Como administrador, quiero registrar ingresos de mercadería con su costo para que el stock y el costo promedio se actualicen | E1 | Must | 5 | 1 | Hecho |
| HU-05 | Como administrador, quiero ver alertas de los productos en o bajo el stock mínimo para reponer a tiempo | E1 | Must | 3 | 1 | Hecho |
| HU-06 | Como administrador, quiero consultar el kardex de cada producto para auditar sus entradas y salidas | E1 | Should | 3 | 1 | Hecho |
| HU-19 | Como administrador, quiero ajustar el stock según el inventario físico (mermas, roturas) dejando el motivo registrado | E1 | Should | 3 | 1 → 2 | Hecho (Sprint 2) |
| HU-07 | Como cajero, quiero registrar una venta con varios productos y calcular el total con IGV y el vuelto | E2 | Must | 8 | 2 | Hecho |
| HU-08 | Como cajero, quiero que el sistema impida vender más de lo disponible para no generar stock negativo | E2 | Must | 3 | 2 | Hecho |
| HU-09 | Como administrador, quiero anular una venta indicando el motivo para que el stock se devuelva automáticamente | E2 | Should | 3 | 2 | Hecho |
| HU-10 | Como cajero, quiero emitir e imprimir la boleta de la venta para entregarla al cliente | E2 | Should | 3 | 2 | Hecho |
| HU-11 | Como dueño, quiero registrar el método de pago (efectivo, tarjeta, Yape, Plin) para cuadrar la caja al cierre **(cambio solicitado en la Sprint Review 1)** | E2 | Must | 3 | 2 | Hecho |
| HU-12 | Como administrador, quiero consultar el historial de ventas con filtros por fecha, método y estado | E2 | Should | 2 | 2 | Hecho |
| HU-13 | Como dueño, quiero un panel con ventas del día, del mes, ticket promedio, valor del inventario y alertas | E3 | Must | 5 | 3 | Hecho |
| HU-14 | Como dueño, quiero un reporte de ventas por día en un rango de fechas | E3 | Must | 3 | 3 | Hecho |
| HU-15 | Como dueño, quiero saber cuáles son los productos más vendidos y su margen | E3 | Must | 3 | 3 | Hecho |
| HU-16 | Como dueño, quiero el inventario valorizado y una lista de reposición sugerida | E3 | Should | 3 | 3 | Hecho |
| HU-17 | Como dueño, quiero exportar los reportes a CSV e imprimirlos para compartirlos con el contador | E3 | Should | 2 | 3 | Hecho |
| HU-18 | Como administrador, quiero descargar y restaurar un respaldo de la información | E4 | Could | 3 | 3 | Hecho |
| TS-02 | Como equipo, quiero pruebas automatizadas de aceptación por historia para evitar regresiones | E4 | Must | 3 | 3 | Hecho |
| HU-20 | Como dueño, quiero usuarios con roles (cajero/administrador) e inicio de sesión | E4 | Could | 8 | Release 2 | Pendiente |
| HU-21 | Como dueño, quiero emitir comprobantes electrónicos ante SUNAT | E2 | Won't (R1) | 13 | Release 2 | Pendiente |
| HU-22 | Como cajero, quiero usar un lector de código de barras en el punto de venta | E2 | Could | 5 | Release 2 | Pendiente |
| HU-23 | Como administrador, quiero controlar lotes y fechas de vencimiento (surgió en la retrospectiva) | E1 | Could | 8 | Release 2 | Pendiente |
| HU-24 | Como dueño, quiero sincronizar varias tiendas en la nube | E4 | Won't (R1) | 13 | Release 2 | Pendiente |

**Release 1:** 67 SP planificados al inicio + 3 SP del cambio HU-11 = **70 SP**, completados en 3 sprints.

## Definition of Ready (DoR)
- La historia sigue el formato *Como… quiero… para…* y tiene criterios de aceptación verificables.
- Está estimada por el equipo y cabe en un sprint (≤ 8 SP).
- No tiene dependencias bloqueantes abiertas.

## Definition of Done (DoD)
- Criterios de aceptación cumplidos y demostrados al Product Owner.
- Prueba automatizada de aceptación en verde (`npm test`) y CI de GitHub Actions aprobado.
- Código revisado por otro integrante mediante *pull request*.
- Desplegado en GitHub Pages y documentado en el tablero.

## Criterios de aceptación (ejemplos)

**HU-07 Registrar venta**
- *Dado* un carrito con productos con stock, *cuando* el cajero cobra en efectivo con monto suficiente, *entonces* se emite la boleta `B001-nnnnnn`, se descuenta el stock y se muestra el vuelto.
- El total incluye IGV (18 %) y se desglosa la operación gravada.
- *Dado* un monto recibido menor al total, *entonces* el sistema no registra la venta y muestra cuánto falta.

**HU-08 Validar stock**
- *Dado* un producto con stock 6, *cuando* se intenta vender 7 (aunque sea en dos líneas), *entonces* se rechaza la venta completa y ningún stock cambia.

**HU-05 Alertas de stock mínimo**
- Un producto activo con stock ≤ stock mínimo aparece en el panel y en la lista de reposición con una cantidad sugerida = 2 × mínimo − stock.
