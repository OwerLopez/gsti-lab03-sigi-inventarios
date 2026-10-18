# Daily Scrum (simulados)

Formato: ¿Qué hice desde la última daily? ¿Qué haré hasta la próxima? ¿Qué me impide avanzar? Cada día simulado equivale a ~30 min de laboratorio. La última columna registra los SP pendientes **al cierre del día** (dato del burndown).

## Sprint 1 (compromiso: 26 SP)

| Día | Integrante | Desde la última daily | Hasta la próxima | Impedimentos | SP pendientes |
|---|---|---|---|---|---|
| 1 | Ower López | Sprint Planning | Repositorio, CI y Pages (TS-01) | — | |
| 1 | Mauricio Zegarra | Sprint Planning | Modelo de producto y validaciones (HU-01) | — | |
| 1 | Cristian Saya | Criterios de aceptación HU-01 a HU-06 | Pruebas de HU-01 | — | **24** |
| 2 | Ower López | TS-01 listo; CI en verde | Ingreso de mercadería (HU-04) | Duda: ¿costo último o promedio? | |
| 2 | Mauricio Zegarra | HU-01 terminada y revisada | Edición/desactivación (HU-02) | — | |
| 2 | Cristian Saya | Pruebas de HU-01 | Aclara con el dueño: **costo promedio ponderado** | Resuelve la duda de Ower | **19** |
| 3 | Ower López | HU-04 terminada | Búsqueda (HU-03) y alertas (HU-05) | Los módulos ES no cargaban en Pages por rutas absolutas → se cambiaron a relativas | |
| 3 | Mauricio Zegarra | HU-02 terminada | Kardex (HU-06) | — | **11** |
| 4 | Ower López | HU-03 y HU-05 terminadas | Ajuste de inventario (HU-19) | — | |
| 4 | Mauricio Zegarra | Kardex con saldo acumulado | Integrar kardex en la vista | — | |
| 4 | Cristian Saya | Pruebas HU-04/HU-05 | Revisión de PR | **Alerta del SM:** HU-19 no entra; se acuerda con el PO devolverla al backlog | **6** |
| 5 | Equipo | HU-06 integrada; pruebas en verde | Preparar Sprint Review | — | **3** (HU-19) |

## Sprint 2 (compromiso: 25 SP)

| Día | Resumen | Impedimentos | SP pendientes |
|---|---|---|---|
| 1 | Se inicia el POS (HU-07) y el arrastre HU-19. El PO ubica HU-11 (cambio del cliente) como Must. | — | 25 |
| 2 | HU-19 terminada; carrito y totales con IGV en progreso. | Redondeo de céntimos daba S/ 0,01 de diferencia → se centralizó `round2` | 22 |
| 3 | POS (HU-07), validación todo-o-nada (HU-08) y anulación (HU-09) terminadas. | — | 8 |
| 4 | Métodos de pago (HU-11) y boleta imprimible (HU-10). | La impresión mostraba el menú → hoja de estilos `@media print` | 2 |
| 5 | Historial con filtros (HU-12); CI en verde; despliegue. | — | 0 |

## Sprint 3 (compromiso: 22 SP)

| Día | Resumen | Impedimentos | SP pendientes |
|---|---|---|---|
| 1 | Funciones de reportes en el dominio y sus pruebas. | — | 22 |
| 2 | Panel con KPIs y gráficos (HU-13). | Chart.js por CDN: se fijó la versión 4.4.1 | 17 |
| 3 | Ventas por día (HU-14) y más vendidos (HU-15). | — | 11 |
| 4 | Valorizado/reposición (HU-16) y exportación CSV (HU-17). | Excel en español abría el CSV en una sola columna → separador `;` y BOM UTF-8 | 6 |
| 5 | Respaldo (HU-18) y suite de pruebas por sprint (TS-02); Release 1 publicado. | — | 0 |
