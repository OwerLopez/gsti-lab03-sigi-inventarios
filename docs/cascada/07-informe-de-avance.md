# Informe de avance al cierre del laboratorio (Día 15)

| Fase | Peso | Plan (línea base) | Real | Avance real | Estado |
|---|---|---|---|---|---|
| 1. Requisitos | 20 % | D1–D3 | D1–D4 (+ reapertura D6–D7 por CR-01) | 100 % | Cerrada (SRS v1.1) |
| 2. Diseño | 25 % | D4–D7 | D5–D12 (congelado D6–D7 por CR-01) | 100 % | Cerrada (diseño v1.1) |
| 3. Implementación | 35 % | D8–D12 | D13–… (proyección D17) | 40 % | En curso: script de BD listo y probado; módulo de productos en desarrollo |
| 4. Pruebas | 15 % | D13–D14 | proyección D18–D19 | 0 % (plan listo) | No iniciada |
| 5. Despliegue y mantenimiento | 5 % | D15 | proyección D20 | 0 % | No iniciada |
| **Total ponderado** | 100 % | **100 %** | | **59 %** | Fin proyectado: D20 |

**Software funcionando entregado al cliente:** ninguno (la cascada solo entrega al final).

## ¿Se alcanzó la implementación?
Sí, pero parcialmente: el equipo entró a la fase de implementación en el Día 13 (5 días tarde) y al cierre tenía la base de datos creada con sus restricciones y vistas de reportes. No se llegó a pruebas ni a despliegue.

## ¿Cómo se ajustó el plan original?
1. Requisitos se extendió un día por entrevistas adicionales con los cajeros.
2. CR-01 obligó a reabrir la SRS (v1.1), congelar el diseño dos días (D6–D7) y rehacer el modelo de datos y el flujo de venta.
3. Se generó una nueva línea base (plan v1.1) que mueve la entrega del D15 al D20.

## ¿Cómo se pudo responder mejor al cambio?
- Validar con prototipos de pantalla **durante** la fase de requisitos (el método de pago habría salido antes).
- Reservar un colchón de gestión del cambio (10–15 %) en el cronograma.
- Diseñar el modelo con catálogos parametrizables (p. ej., `METODO_PAGO`) desde la primera versión.
- Adoptar un enfoque híbrido: requisitos y arquitectura en cascada, implementación por incrementos.
