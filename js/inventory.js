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
  TARJETA: 'Tarjeta',
  YAPE: 'Yape',
  PLIN: 'Plin',
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

/* ------------------------------------------------------------------ */
/* Ventas (HU-07 a HU-12)                                             */
/* ------------------------------------------------------------------ */

/** Precios con IGV incluido (práctica habitual en el retail peruano). */
export function computeTotals(lines) {
  const total = round2(lines.reduce((acc, l) => acc + l.qty * l.price - (l.discount || 0), 0));
  const subtotal = round2(total / (1 + IGV));
  return { subtotal, igv: round2(total - subtotal), total };
}

export function registerSale(state, { items, paymentMethod = 'EFECTIVO', amountReceived, customer = '' }, { at = nowISO(), user = 'caja01' } = {}) {
  if (!Array.isArray(items) || items.length === 0) throw new DomainError('La venta no tiene productos.');
  if (!PAYMENT_METHODS[paymentMethod]) throw new DomainError(`Método de pago no válido: ${paymentMethod}.`);

  // Se agrupan líneas repetidas y se valida TODO el stock antes de mover nada.
  const grouped = new Map();
  for (const it of items) {
    const qty = requireNumber(it.qty, 'cantidad', { integer: true, strictlyPositive: true });
    grouped.set(it.productId, (grouped.get(it.productId) || 0) + qty);
  }
  const lines = [];
  for (const [productId, qty] of grouped) {
    const p = findProduct(state, productId);
    if (!p.active) throw new DomainError(`El producto "${p.name}" está desactivado.`);
    if (p.stock < qty) throw new DomainError(`Stock insuficiente de "${p.name}": disponible ${p.stock}, solicitado ${qty}.`);
    lines.push({ productId, sku: p.sku, name: p.name, qty, price: p.price, cost: p.cost, discount: 0, amount: round2(qty * p.price) });
  }

  const totals = computeTotals(lines);
  let change = 0;
  if (paymentMethod === 'EFECTIVO') {
    const received = amountReceived === undefined || amountReceived === '' ? totals.total : requireNumber(amountReceived, 'monto recibido');
    if (received < totals.total) throw new DomainError(`Monto recibido insuficiente: falta S/ ${(totals.total - received).toFixed(2)}.`);
    change = round2(received - totals.total);
  }

  const sale = {
    id: nextId(state, 'sale', 'B001', 6),
    at,
    user,
    customer: customer.trim() || 'Cliente varios',
    paymentMethod,
    lines,
    ...totals,
    change,
    status: 'EMITIDA',
  };
  for (const l of lines) {
    pushMovement(state, { productId: l.productId, type: MOVEMENT_TYPES.SALIDA, qty: -l.qty, unitCost: l.cost, reference: sale.id }, { at, user });
  }
  state.sales.push(sale);
  return sale;
}

export function cancelSale(state, saleId, reason, { at = nowISO(), user = 'admin' } = {}) {
  const sale = state.sales.find((s) => s.id === saleId);
  if (!sale) throw new DomainError(`No existe la venta ${saleId}.`);
  if (sale.status === 'ANULADA') throw new DomainError(`La venta ${saleId} ya fue anulada.`);
  const why = requireText(reason, 'motivo de anulación');
  for (const l of sale.lines) {
    pushMovement(state, { productId: l.productId, type: MOVEMENT_TYPES.DEVOLUCION, qty: l.qty, unitCost: l.cost, reference: sale.id, note: why }, { at, user });
  }
  sale.status = 'ANULADA';
  sale.cancelReason = why;
  sale.cancelledAt = at;
  return sale;
}

/* ------------------------------------------------------------------ */
/* Reportes (HU-13 a HU-17)                                           */
/* ------------------------------------------------------------------ */

const dayOf = (iso) => iso.slice(0, 10);

function salesInRange(state, from, to) {
  return state.sales.filter((s) => s.status === 'EMITIDA' && (!from || dayOf(s.at) >= from) && (!to || dayOf(s.at) <= to));
}

export function salesByDay(state, { from, to } = {}) {
  const map = new Map();
  for (const s of salesInRange(state, from, to)) {
    const d = dayOf(s.at);
    const row = map.get(d) || { day: d, tickets: 0, total: 0 };
    row.tickets += 1;
    row.total = round2(row.total + s.total);
    map.set(d, row);
  }
  return [...map.values()].sort((a, b) => a.day.localeCompare(b.day));
}

export function topProducts(state, { from, to, limit = 10 } = {}) {
  const map = new Map();
  for (const s of salesInRange(state, from, to)) {
    for (const l of s.lines) {
      const row = map.get(l.productId) || { productId: l.productId, sku: l.sku, name: l.name, units: 0, revenue: 0, margin: 0 };
      row.units += l.qty;
      row.revenue = round2(row.revenue + l.amount);
      row.margin = round2(row.margin + (l.price / (1 + IGV) - l.cost) * l.qty);
      map.set(l.productId, row);
    }
  }
  return [...map.values()].sort((a, b) => b.units - a.units || b.revenue - a.revenue).slice(0, limit);
}

export function salesByPaymentMethod(state, { from, to } = {}) {
  const res = Object.keys(PAYMENT_METHODS).map((k) => ({ method: k, label: PAYMENT_METHODS[k], tickets: 0, total: 0 }));
  for (const s of salesInRange(state, from, to)) {
    const row = res.find((r) => r.method === s.paymentMethod);
    row.tickets += 1;
    row.total = round2(row.total + s.total);
  }
  return res;
}

export function inventoryValuation(state) {
  const rows = state.products.filter((p) => p.active).map((p) => ({
    sku: p.sku, name: p.name, category: p.category, stock: p.stock,
    cost: p.cost, price: p.price,
    valueCost: round2(p.stock * p.cost),
    valuePrice: round2(p.stock * p.price),
  }));
  const byCategory = {};
  for (const r of rows) byCategory[r.category] = round2((byCategory[r.category] || 0) + r.valueCost);
  return {
    rows,
    byCategory,
    totalCost: round2(rows.reduce((a, r) => a + r.valueCost, 0)),
    totalPrice: round2(rows.reduce((a, r) => a + r.valuePrice, 0)),
  };
}

export function dashboard(state, today = new Date().toISOString().slice(0, 10)) {
  const todaySales = salesInRange(state, today, today);
  const monthPrefix = today.slice(0, 7);
  const monthSales = state.sales.filter((s) => s.status === 'EMITIDA' && s.at.startsWith(monthPrefix));
  return {
    salesToday: round2(todaySales.reduce((a, s) => a + s.total, 0)),
    ticketsToday: todaySales.length,
    salesMonth: round2(monthSales.reduce((a, s) => a + s.total, 0)),
    averageTicket: monthSales.length ? round2(monthSales.reduce((a, s) => a + s.total, 0) / monthSales.length) : 0,
    activeProducts: state.products.filter((p) => p.active).length,
    lowStock: lowStockProducts(state).length,
    inventoryValue: inventoryValuation(state).totalCost,
  };
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
