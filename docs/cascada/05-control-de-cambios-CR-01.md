# Solicitud de cambio CR-01

| Campo | Detalle |
|---|---|
| Código | CR-01 |
| Fecha de solicitud | Día 6 (fase de Diseño en curso) |
| Solicitante | Dueño de Minimarket Sumaq |
| Descripción | Registrar el método de pago de cada venta (efectivo, tarjeta, Yape, Plin), el monto recibido y el vuelto, y obtener un reporte de cierre de caja por método de pago |
| Justificación | Más de la mitad de las ventas se cobran con billeteras digitales; el cierre de caja no cuadra |
| Fase afectada | Requisitos (SRS v1.0 ya aprobada) y Diseño (modelo de datos en elaboración) |

## Análisis de impacto (J. Coronado / M. Congona)

| Artefacto | Impacto | Esfuerzo |
|---|---|---|
| SRS | Nuevos RF-09, RF-15 y RN-06; nueva versión 1.1 y nueva aprobación | 1 día |
| Modelo de datos | Nueva tabla `METODO_PAGO`; campos `metodo_pago`, `monto_recibido`, `vuelto` en `VENTA` | 0,5 día |
| Diagramas de flujo | Rehacer el flujo "Registrar venta" | 0,5 día |
| Prototipos | Rediseñar pantalla de cobro | 0,5 día |
| Plan de pruebas | Nuevos casos CP-09 a CP-11 | 0,5 día |
| **Cronograma** | **+4 días**: D6–D7 diseño congelado mientras se analiza y aprueba el cambio, y 2 días de rediseño | — |

## Decisión
**Aprobado** por el cliente y el jefe de proyecto en el Día 7. Se actualiza la línea base del cronograma (plan v1.1): el diseño termina en D12 en lugar de D7 (incluye el día de retraso que ya traía requisitos) y la entrega se proyecta al D20.

## Lección
En cascada el cambio llegó cuando la SRS ya estaba firmada: hubo que regresar a una fase cerrada, volver a aprobar documentos y detener el diseño. El mismo cambio en el equipo Scrum se convirtió en una historia (HU-11) del sprint siguiente.
