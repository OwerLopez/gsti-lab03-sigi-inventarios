-- =====================================================================
-- SGI Minimarket Sumaq · Script de base de datos (fase de implementación)
-- Motor: SQLite 3 (compatible con PostgreSQL cambiando AUTOINCREMENT por SERIAL)
-- Versión 1.1 (incluye CR-01: métodos de pago)
-- Responsable: Anthony Leonel Chaisa Fernández · Revisión: Javier Coronado Peña
-- =====================================================================
PRAGMA foreign_keys = ON;

CREATE TABLE categoria (
  id_categoria INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre       VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE usuario (
  id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario    VARCHAR(30) NOT NULL UNIQUE,
  nombre     VARCHAR(100) NOT NULL,
  rol        VARCHAR(15) NOT NULL CHECK (rol IN ('ADMIN', 'CAJERO'))
);

CREATE TABLE proveedor (
  id_proveedor INTEGER PRIMARY KEY AUTOINCREMENT,
  ruc          CHAR(11) NOT NULL UNIQUE,
  razon_social VARCHAR(120) NOT NULL
);

CREATE TABLE metodo_pago (                       -- CR-01
  codigo      VARCHAR(10) PRIMARY KEY,
  descripcion VARCHAR(30) NOT NULL
);

CREATE TABLE producto (
  id_producto    INTEGER PRIMARY KEY AUTOINCREMENT,
  sku            VARCHAR(20) NOT NULL UNIQUE,
  nombre         VARCHAR(120) NOT NULL,
  id_categoria   INTEGER NOT NULL REFERENCES categoria(id_categoria),
  unidad         VARCHAR(5) NOT NULL DEFAULT 'UND',
  costo_promedio DECIMAL(10,2) NOT NULL CHECK (costo_promedio >= 0),
  precio_venta   DECIMAL(10,2) NOT NULL CHECK (precio_venta > 0),
  stock_actual   INTEGER NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
  stock_minimo   INTEGER NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0),
  activo         BOOLEAN NOT NULL DEFAULT 1,
  CHECK (precio_venta >= costo_promedio)                      -- RN-01
);

CREATE TABLE movimiento (
  id_movimiento  INTEGER PRIMARY KEY AUTOINCREMENT,
  fecha          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  id_producto    INTEGER NOT NULL REFERENCES producto(id_producto),
  tipo           VARCHAR(10) NOT NULL CHECK (tipo IN ('INGRESO', 'SALIDA', 'AJUSTE', 'DEVOLUCION')),
  cantidad       INTEGER NOT NULL CHECK (cantidad <> 0),
  costo_unitario DECIMAL(10,2) NOT NULL,
  saldo          INTEGER NOT NULL CHECK (saldo >= 0),            -- RNF-05
  id_proveedor   INTEGER REFERENCES proveedor(id_proveedor),
  referencia     VARCHAR(30),
  motivo         VARCHAR(120),
  id_usuario     INTEGER NOT NULL REFERENCES usuario(id_usuario)
);

CREATE TABLE venta (
  id_venta         INTEGER PRIMARY KEY AUTOINCREMENT,
  serie_numero     VARCHAR(12) NOT NULL UNIQUE,                  -- RN-04
  fecha            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cliente          VARCHAR(120) NOT NULL DEFAULT 'Cliente varios',
  metodo_pago      VARCHAR(10) NOT NULL REFERENCES metodo_pago(codigo), -- CR-01
  op_gravada       DECIMAL(10,2) NOT NULL,
  igv              DECIMAL(10,2) NOT NULL,
  total            DECIMAL(10,2) NOT NULL CHECK (total > 0),
  monto_recibido   DECIMAL(10,2),                                 -- CR-01 / RN-06
  vuelto           DECIMAL(10,2) NOT NULL DEFAULT 0,
  estado           VARCHAR(8) NOT NULL DEFAULT 'EMITIDA' CHECK (estado IN ('EMITIDA', 'ANULADA')),
  motivo_anulacion VARCHAR(120),
  id_usuario       INTEGER NOT NULL REFERENCES usuario(id_usuario)
);

CREATE TABLE detalle_venta (
  id_venta        INTEGER NOT NULL REFERENCES venta(id_venta),
  id_producto     INTEGER NOT NULL REFERENCES producto(id_producto),
  cantidad        INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario DECIMAL(10,2) NOT NULL,
  costo_unitario  DECIMAL(10,2) NOT NULL,
  importe         DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (id_venta, id_producto)
);

CREATE INDEX ix_movimiento_producto ON movimiento(id_producto, fecha);
CREATE INDEX ix_venta_fecha ON venta(fecha);

-- Vistas para los reportes (RF-06, RF-13, RF-14, RF-15, RF-16)
CREATE VIEW v_stock_bajo AS
  SELECT sku, nombre, stock_actual, stock_minimo, (2 * stock_minimo - stock_actual) AS sugerido
  FROM producto WHERE activo = 1 AND stock_actual <= stock_minimo;

CREATE VIEW v_ventas_por_dia AS
  SELECT date(fecha) AS dia, COUNT(*) AS comprobantes, ROUND(SUM(total), 2) AS total
  FROM venta WHERE estado = 'EMITIDA' GROUP BY date(fecha);

CREATE VIEW v_mas_vendidos AS
  SELECT p.sku, p.nombre, SUM(d.cantidad) AS unidades, ROUND(SUM(d.importe), 2) AS ventas
  FROM detalle_venta d JOIN venta v ON v.id_venta = d.id_venta JOIN producto p ON p.id_producto = d.id_producto
  WHERE v.estado = 'EMITIDA' GROUP BY p.id_producto ORDER BY unidades DESC;

CREATE VIEW v_cierre_caja AS                                     -- CR-01 / RF-15
  SELECT date(v.fecha) AS dia, m.descripcion AS metodo, COUNT(*) AS comprobantes, ROUND(SUM(v.total), 2) AS total
  FROM venta v JOIN metodo_pago m ON m.codigo = v.metodo_pago
  WHERE v.estado = 'EMITIDA' GROUP BY date(v.fecha), m.descripcion;

CREATE VIEW v_inventario_valorizado AS
  SELECT c.nombre AS categoria, SUM(p.stock_actual * p.costo_promedio) AS valor_costo
  FROM producto p JOIN categoria c ON c.id_categoria = p.id_categoria
  WHERE p.activo = 1 GROUP BY c.nombre;

-- Datos de referencia
INSERT INTO metodo_pago VALUES ('EFECTIVO', 'Efectivo'), ('TARJETA', 'Tarjeta'), ('YAPE', 'Yape'), ('PLIN', 'Plin');
INSERT INTO usuario (usuario, nombre, rol) VALUES ('admin', 'Dueño de la tienda', 'ADMIN'), ('caja01', 'Cajero turno mañana', 'CAJERO');
INSERT INTO categoria (nombre) VALUES ('Abarrotes'), ('Bebidas'), ('Lácteos'), ('Limpieza');
INSERT INTO proveedor (ruc, razon_social) VALUES ('20455667788', 'Distribuidora del Sur SAC');
INSERT INTO producto (sku, nombre, id_categoria, unidad, costo_promedio, precio_venta, stock_actual, stock_minimo) VALUES
  ('ABA-001', 'Arroz Costeño extra 5 kg', 1, 'BOL', 17.50, 21.90, 0, 10),
  ('BEB-001', 'Gaseosa Inca Kola 1.5 L', 2, 'BOT', 5.20, 6.80, 0, 24),
  ('LAC-001', 'Leche Gloria azul 400 g', 3, 'LAT', 3.60, 4.40, 0, 48);
