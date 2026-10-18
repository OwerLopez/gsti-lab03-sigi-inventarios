# Sprint Reviews y Retrospectivas

## Sprint Review 1
- **Demostrado:** alta y edición de productos, ingreso de mercadería con costo promedio, alertas de stock mínimo y kardex.
- **No terminado:** HU-19 (ajuste por inventario físico), vuelve al backlog con la misma prioridad.
- **Retroalimentación del dueño de la tienda:** *"La mitad de mis clientes paga con Yape o Plin; al cerrar caja necesito saber cuánto entró por cada medio."*
- **Ajuste del backlog:** se crea **HU-11 Métodos de pago (3 SP, Must)** y el PO la ubica en el Sprint 2 por encima de HU-12. No se renegoció ningún contrato ni se cambió el plan del release: el cambio entró en el siguiente sprint.

## Sprint Review 2
- **Demostrado:** punto de venta completo, boleta, anulación, historial y pagos con Yape/Plin/Tarjeta.
- **Retroalimentación:** el dueño pide ver "qué reponer el lunes" → se refina HU-16 para incluir lista de reposición con costo estimado.

## Sprint Review 3 (presentación final)
- Release 1 publicado: https://owerlopez.github.io/gsti-lab03-sigi-inventarios/
- 23 pruebas automatizadas en verde, 70/70 SP completados.
- Quedan en el backlog para el Release 2: roles de usuario, facturación electrónica, lector de código de barras, lotes/vencimientos y multi-tienda.

## Retrospectiva Sprint 1 (Start / Stop / Continue)
| Empezar | Dejar de | Continuar |
|---|---|---|
| Partir historias grandes antes del planning | Comprometer historias sin criterios de aceptación cerrados | Integración continua desde el día 1 |
| Revisar el burndown en cada daily | Esperar al final para integrar vistas | Pruebas escritas junto con el código |

## Retrospectiva Sprint 2
| Qué salió bien | Qué mejorar |
|---|---|
| El cambio de HU-11 entró sin fricción gracias al backlog priorizado | Estimamos bajo el cálculo de IGV y redondeos |
| Velocidad estable (25 SP) | Las revisiones de PR se acumularon el día 4 |

## Retrospectiva final (cierre del laboratorio)

**¿Qué salió bien?**
- Entregamos software funcionando al final de cada sprint; el cliente vio avances reales desde la primera semana.
- El cambio de requisitos (métodos de pago) se absorbió en el sprint siguiente sin retrasar el release.
- Las pruebas automatizadas por historia nos dieron confianza para refactorizar (separación del dominio y de las vistas).

**¿Qué se puede mejorar?**
- La estimación del Sprint 1 fue optimista (26 comprometidos vs 23 completados).
- Faltó involucrar al dueño en la definición de reportes desde el inicio.
- Los dailies a veces se extendieron más de 5 minutos.

**¿Qué haremos diferente en el próximo sprint (Release 2)?**
- Comprometer como máximo la velocidad promedio (23 SP).
- Refinamiento del backlog a mitad de sprint con el PO.
- Agregar pruebas de interfaz (end-to-end) a la *Definition of Done*.
- Empezar por HU-20 (roles) porque es prerrequisito de la facturación electrónica.
