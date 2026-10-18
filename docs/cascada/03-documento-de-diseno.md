# Documento de diseño del sistema

**Versión:** 1.1 · **Responsable:** Javier Coronado Peña · **Revisión:** Mauricio Congona, Anthony Chaisa

## 1. Arquitectura

Arquitectura en tres capas. La capa de datos es una base relacional (SQLite en la tienda; migrable a PostgreSQL).

```mermaid
flowchart LR
  subgraph Cliente["Capa de presentación (navegador)"]
    UI1[Pantallas de stock]
    UI2[Punto de venta]
    UI3[Reportes]
  end
  subgraph Logica["Capa de lógica de negocio"]
    S1[Servicio de productos]
    S2[Servicio de inventario / kardex]
    S3[Servicio de ventas]
    S4[Servicio de reportes]
  end
  subgraph Datos["Capa de datos"]
    DB[(Base de datos relacional)]
  end
  UI1 --> S1 & S2
  UI2 --> S3
  UI3 --> S4
  S1 & S2 & S3 & S4 --> DB
  S3 -->|descuenta stock| S2
```

## 2. Modelo de datos (entidad–relación)

```mermaid
erDiagram
  CATEGORIA ||--o{ PRODUCTO : clasifica
  PRODUCTO ||--o{ MOVIMIENTO : registra
  PRODUCTO ||--o{ DETALLE_VENTA : "se vende en"
  VENTA ||--|{ DETALLE_VENTA : contiene
  USUARIO ||--o{ VENTA : emite
  USUARIO ||--o{ MOVIMIENTO : realiza
  PROVEEDOR ||--o{ MOVIMIENTO : abastece
  METODO_PAGO ||--o{ VENTA : "se paga con"

  CATEGORIA { int id_categoria PK
    varchar nombre }
  PRODUCTO { int id_producto PK
    varchar sku UK
    varchar nombre
    int id_categoria FK
    varchar unidad
    decimal costo_promedio
    decimal precio_venta
    int stock_actual
    int stock_minimo
    boolean activo }
  MOVIMIENTO { int id_movimiento PK
    datetime fecha
    int id_producto FK
    varchar tipo
    int cantidad
    decimal costo_unitario
    int saldo
    int id_proveedor FK
    varchar referencia
    varchar motivo
    int id_usuario FK }
  VENTA { int id_venta PK
    varchar serie_numero UK
    datetime fecha
    varchar cliente
    varchar metodo_pago FK
    decimal op_gravada
    decimal igv
    decimal total
    decimal monto_recibido
    decimal vuelto
    varchar estado
    varchar motivo_anulacion
    int id_usuario FK }
  DETALLE_VENTA { int id_venta PK
    int id_producto PK
    int cantidad
    decimal precio_unitario
    decimal costo_unitario
    decimal importe }
  USUARIO { int id_usuario PK
    varchar usuario UK
    varchar nombre
    varchar rol }
  PROVEEDOR { int id_proveedor PK
    varchar ruc UK
    varchar razon_social }
  METODO_PAGO { varchar codigo PK
    varchar descripcion }
```

> Las entidades `METODO_PAGO` y los campos `metodo_pago`, `monto_recibido` y `vuelto` se agregaron en la versión 1.1 por la solicitud de cambio CR-01.

## 3. Diccionario de datos (extracto)

| Tabla | Campo | Tipo | Restricción | Descripción |
|---|---|---|---|---|
| producto | sku | VARCHAR(20) | UNIQUE, NOT NULL | Código interno |
| producto | precio_venta | DECIMAL(10,2) | CHECK ≥ costo_promedio | Precio con IGV |
| producto | stock_actual | INTEGER | CHECK ≥ 0 | Saldo vigente |
| movimiento | tipo | VARCHAR(10) | IN (INGRESO, SALIDA, AJUSTE, DEVOLUCION) | Naturaleza del movimiento |
| movimiento | saldo | INTEGER | CHECK ≥ 0 | Stock después del movimiento |
| venta | serie_numero | VARCHAR(12) | UNIQUE | B001-000001 |
| venta | estado | VARCHAR(8) | IN (EMITIDA, ANULADA) | Estado del comprobante |
| venta | metodo_pago | VARCHAR(10) | FK método_pago | Efectivo, tarjeta, Yape, Plin |

## 4. Diagramas de flujo

### 4.1 Registrar venta
```mermaid
flowchart TD
  A([Inicio]) --> B[Cajero busca y agrega productos al carrito]
  B --> C{¿Stock suficiente para cada línea?}
  C -- No --> C1[Mostrar mensaje de stock insuficiente] --> B
  C -- Sí --> D[Calcular total, op. gravada e IGV]
  D --> E[Seleccionar método de pago]
  E --> F{¿Efectivo?}
  F -- Sí --> G[Ingresar monto recibido]
  G --> H{¿Monto ≥ total?}
  H -- No --> G
  H -- Sí --> I[Calcular vuelto]
  F -- No --> J[Confirmar pago digital]
  I --> K[Generar comprobante B001-n]
  J --> K
  K --> L[Registrar SALIDA en kardex y descontar stock]
  L --> M{¿Stock ≤ mínimo?}
  M -- Sí --> N[Generar alerta de reposición]
  M -- No --> O[Imprimir boleta]
  N --> O --> P([Fin])
```

### 4.2 Ingreso de mercadería (control de stock)
```mermaid
flowchart TD
  A([Inicio]) --> B[Seleccionar producto]
  B --> C{¿Producto activo?}
  C -- No --> C1[Rechazar ingreso] --> Z([Fin])
  C -- Sí --> D[Ingresar cantidad, costo y proveedor]
  D --> E{¿Cantidad > 0?}
  E -- No --> D
  E -- Sí --> F[Recalcular costo promedio ponderado]
  F --> G[Sumar al stock y registrar INGRESO en kardex]
  G --> H[Actualizar alertas de stock]
  H --> Z
```

### 4.3 Generación de reportes
```mermaid
flowchart TD
  A([Inicio]) --> B[Elegir tipo de reporte]
  B --> C[Definir rango de fechas]
  C --> D[Consultar ventas EMITIDAS del rango]
  D --> E{Tipo}
  E -- Ventas por día --> F[Agrupar por fecha]
  E -- Más vendidos --> G[Sumar unidades por producto y ordenar]
  E -- Método de pago --> H[Agrupar por método]
  E -- Valorizado --> I[Stock x costo promedio por producto]
  F & G & H & I --> J[Mostrar tabla y gráfico]
  J --> K{¿Exportar?}
  K -- CSV --> L[Descargar archivo]
  K -- Imprimir --> M[Vista de impresión]
  K -- No --> N([Fin])
  L --> N
  M --> N
```

## 5. Prototipos de pantalla
Ver imágenes `docs/diagramas/wireframe-*.png` (punto de venta y lista de productos), elaboradas en la fase de diseño y validadas con el dueño.
