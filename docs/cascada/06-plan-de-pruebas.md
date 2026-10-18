# Plan de pruebas (fase 4, preparado durante el diseño)

**Responsable:** Anthony Leonel Chaisa Fernández · **Estado:** planificado; la ejecución depende del cierre de la implementación.

| ID | Requisito | Caso de prueba | Datos | Resultado esperado |
|---|---|---|---|---|
| CP-01 | RF-01 | Registrar producto con SKU nuevo | ABA-010, costo 2, precio 3 | Producto creado con stock 0 |
| CP-02 | RF-01 / RN-01 | Registrar producto con precio < costo | costo 10, precio 8 | Rechazo con mensaje |
| CP-03 | RF-04 / RN-02 | Ingreso con costo distinto | 20 und a 17,50 + 20 und a 18,50 | Costo promedio 18,00 |
| CP-04 | RF-06 | Producto bajo el mínimo | stock 4, mínimo 5 | Aparece en alertas |
| CP-05 | RF-08 | Venta de 2 productos | 2 arroz + 1 leche | Total 48,20; stock descontado |
| CP-06 | RF-10 / RNF-05 | Venta con stock insuficiente | 7 und con stock 6 | Rechazo; ningún stock cambia |
| CP-07 | RF-11 | Anular venta | B001-000001 | Estado ANULADA; stock devuelto |
| CP-08 | RF-13 | Ventas por día | Rango de 2 días | Totales por día correctos |
| CP-09 | RF-09 (CR-01) | Venta con Yape | método YAPE | Registrada sin vuelto |
| CP-10 | RN-06 (CR-01) | Efectivo con monto insuficiente | total 21,90, recibe 20 | Rechazo |
| CP-11 | RF-15 (CR-01) | Cierre de caja | 3 ventas, 3 métodos | Totales por método |
| CP-12 | RNF-01 | Rendimiento de venta | 5 000 productos | < 2 s |

Criterio de salida de la fase: 100 % de casos de prioridad alta aprobados y 0 defectos críticos abiertos.
