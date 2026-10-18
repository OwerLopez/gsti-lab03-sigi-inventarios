/**
 * SIGI Retail - Núcleo de dominio (sin dependencias del navegador).
 *
 * Todas las funciones reciben el estado y lo modifican de forma controlada,
 * validando las reglas de negocio. Así el mismo código se usa en la interfaz
 * y en las pruebas automatizadas (node --test).
 */

export const IGV = 0.18;

export const PAYMENT_METHODS = {
  EFECTIVO: 'Efectivo',
};

export const MOVEMENT_TYPES = {
  INGRESO: 'INGRESO',     // compra o reposición de mercadería
  SALIDA: 'SALIDA',       // salida por venta
  AJUSTE: 'AJUSTE',       // ajuste por inventario físico (merma, rotura, conteo)
  DEVOLUCION: 'DEVOLUCION', // reingreso por anulación de venta
};

export class DomainError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DomainError';
  }
}

export function createEmptyState() {
  return {
    version: 1,
    settings: { storeName: 'Minimarket Sumaq', ruc: '20600000001', address: 'Av. Ejército 512, Yanahuara - Arequipa' },
    categories: [],
    products: [],
    movements: [],
    sales: [],
    seq: { product: 0, movement: 0, sale: 0 },
  };
}

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const nowISO = () => new Date().toISOString();

function nextId(state, key, prefix, width = 4) {
  state.seq[key] += 1;
  return `${prefix}-${String(state.seq[key]).padStart(width, '0')}`;
}

function requireText(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new DomainError(`El campo "${field}" es obligatorio.`);
  }
  return value.trim();
}

function requireNumber(value, field, { min = 0, integer = false, strictlyPositive = false } = {}) {
  const n = Number(value);
  if (!Number.isFinite(n)) throw new DomainError(`El campo "${field}" debe ser numérico.`);
  if (integer && !Number.isInteger(n)) throw new DomainError(`El campo "${field}" debe ser un número entero.`);
  if (strictlyPositive && n <= 0) throw new DomainError(`El campo "${field}" debe ser mayor que cero.`);
  if (n < min) throw new DomainError(`El campo "${field}" no puede ser menor que ${min}.`);
  return n;
}

/* ------------------------------------------------------------------ */
/* Productos (HU-01, HU-02, HU-03)                                    */
/* ------------------------------------------------------------------ */

export function addCategory(state, name) {
  const clean = requireText(name, 'categoría');
  if (!state.categories.some((c) => c.toLowerCase() === clean.toLowerCase())) {
    state.categories.push(clean);
    state.categories.sort((a, b) => a.localeCompare(b, 'es'));
  }
  return clean;
}

export function findProduct(state, id) {
  const product = state.products.find((p) => p.id === id);
  if (!product) throw new DomainError(`No existe el producto ${id}.`);
  return product;
}

export function createProduct(state, data, { at = nowISO(), user = 'admin' } = {}) {
  const sku = requireText(data.sku, 'código (SKU)').toUpperCase();
  if (state.products.some((p) => p.sku === sku)) {
    throw new DomainError(`Ya existe un producto con el código ${sku}.`);
  }
  const product = {
    id: nextId(state, 'product', 'P'),
    sku,
    name: requireText(data.name, 'nombre'),
    category: addCategory(state, data.category || 'General'),
    unit: (data.unit || 'UND').toUpperCase(),
    cost: round2(requireNumber(data.cost, 'costo', { min: 0 })),
    price: round2(requireNumber(data.price, 'precio de venta', { strictlyPositive: true })),
    stock: 0,
    minStock: requireNumber(data.minStock ?? 0, 'stock mínimo', { integer: true }),
    active: true,
    createdAt: at,
  };
  if (product.price < product.cost) {
    throw new DomainError('El precio de venta no puede ser menor que el costo.');
  }
  state.products.push(product);
  const initial = Number(data.initialStock || 0);
  if (initial > 0) {
    registerEntry(state, { productId: product.id, qty: initial, unitCost: product.cost, note: 'Stock inicial' }, { at, user });
  }
  return product;
}

export function updateProduct(state, id, changes) {
  const product = findProduct(state, id);
  const next = { ...product };
  if (changes.name !== undefined) next.name = requireText(changes.name, 'nombre');
  if (changes.category !== undefined) next.category = addCategory(state, changes.category);
  if (changes.unit !== undefined) next.unit = String(changes.unit).toUpperCase();
  if (changes.cost !== undefined) next.cost = round2(requireNumber(changes.cost, 'costo'));
  if (changes.price !== undefined) next.price = round2(requireNumber(changes.price, 'precio de venta', { strictlyPositive: true }));
  if (changes.minStock !== undefined) next.minStock = requireNumber(changes.minStock, 'stock mínimo', { integer: true });
  if (next.price < next.cost) throw new DomainError('El precio de venta no puede ser menor que el costo.');
  Object.assign(product, next);
  return product;
}

export function setProductActive(state, id, active) {
  const product = findProduct(state, id);
  product.active = Boolean(active);
  return product;
}

export function searchProducts(state, { text = '', category = '', onlyActive = false, onlyLow = false } = {}) {
  const q = text.trim().toLowerCase();
  return state.products.filter((p) => {
    if (onlyActive && !p.active) return false;
    if (category && p.category !== category) return false;
    if (onlyLow && !isLowStock(p)) return false;
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
  });
}

/* ------------------------------------------------------------------ */
/* Control de stock (HU-04, HU-05, HU-06)                             */
/* ------------------------------------------------------------------ */

function pushMovement(state, { productId, type, qty, unitCost, reference = '', note = '' }, { at, user }) {
  const product = findProduct(state, productId);
  const balance = product.stock + qty;
  if (balance < 0) {
    throw new DomainError(`Stock insuficiente de "${product.name}": disponible ${product.stock}, solicitado ${Math.abs(qty)}.`);
  }
  product.stock = balance;
  const movement = {
    id: nextId(state, 'movement', 'M', 5),
    at,
    productId,
    type,
    qty,
    unitCost: round2(unitCost ?? product.cost),
    balance,
    reference,
    note,
    user,
  };
  state.movements.push(movement);
  return movement;
}

/** Ingreso de mercadería: aumenta stock y recalcula el costo promedio ponderado. */
export function registerEntry(state, { productId, qty, unitCost, supplier = '', note = '' }, { at = nowISO(), user = 'admin' } = {}) {
  const product = findProduct(state, productId);
  if (!product.active) throw new DomainError(`El producto "${product.name}" está desactivado.`);
  const q = requireNumber(qty, 'cantidad', { integer: true, strictlyPositive: true });
  const cost = unitCost === undefined || unitCost === '' ? product.cost : requireNumber(unitCost, 'costo unitario');
  const totalUnits = product.stock + q;
  product.cost = totalUnits > 0 ? round2((product.stock * product.cost + q * cost) / totalUnits) : cost;
  return pushMovement(state, {
    productId, type: MOVEMENT_TYPES.INGRESO, qty: q, unitCost: cost,
    reference: supplier ? `Prov.: ${supplier}` : '', note,
  }, { at, user });
}

/** Ajuste por inventario físico: el usuario indica el stock contado. */
export function adjustStock(state, { productId, countedStock, reason }, { at = nowISO(), user = 'admin' } = {}) {
  const product = findProduct(state, productId);
  const counted = requireNumber(countedStock, 'stock contado', { integer: true });
  const why = requireText(reason, 'motivo del ajuste');
  const diff = counted - product.stock;
  if (diff === 0) throw new DomainError('El stock contado es igual al stock del sistema; no hay ajuste que registrar.');
  return pushMovement(state, { productId, type: MOVEMENT_TYPES.AJUSTE, qty: diff, note: why }, { at, user });
}

export function isLowStock(product) {
  return product.active && product.stock <= product.minStock;
}

export function lowStockProducts(state) {
  return state.products
    .filter(isLowStock)
    .map((p) => ({ ...p, toOrder: Math.max(p.minStock * 2 - p.stock, 1) }))
    .sort((a, b) => a.stock - a.minStock - (b.stock - b.minStock));
}

export function kardex(state, productId) {
  findProduct(state, productId);
  return state.movements.filter((m) => m.productId === productId).sort((a, b) => a.at.localeCompare(b.at));
}

/** Exportación a CSV compatible con Excel/LibreOffice/Google Sheets (separador ;). */
export function toCSV(rows, columns) {
  const esc = (v) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = columns.map((c) => esc(c.label)).join(';');
  const body = rows.map((r) => columns.map((c) => esc(typeof c.value === 'function' ? c.value(r) : r[c.key])).join(';'));
  return [header, ...body].join('\r\n');
}
