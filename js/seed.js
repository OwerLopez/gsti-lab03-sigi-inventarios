/**
 * Datos de demostración de "Minimarket Sumaq" (tienda ficticia de Arequipa).
 * Genera el catálogo, los ingresos iniciales y ~30 días de ventas con un
 * generador pseudoaleatorio con semilla fija, para que todos los integrantes
 * del equipo vean exactamente los mismos datos al abrir la aplicación.
 */
import { createEmptyState, createProduct, registerEntry, registerSale, cancelSale, adjustStock } from './inventory.js';

export const CATALOG = [
  // sku, nombre, categoría, unidad, costo, precio, stock mínimo, stock inicial
  ['ABA-001', 'Arroz Costeño extra 5 kg', 'Abarrotes', 'BOL', 17.5, 21.9, 10, 60],
  ['ABA-002', 'Azúcar rubia Cartavio 1 kg', 'Abarrotes', 'BOL', 3.6, 4.5, 15, 80],
  ['ABA-003', 'Aceite Primor premium 900 ml', 'Abarrotes', 'BOT', 8.9, 10.9, 12, 48],
  ['ABA-004', 'Fideo spaghetti Don Vittorio 500 g', 'Abarrotes', 'PAQ', 2.8, 3.6, 20, 90],
  ['ABA-005', 'Atún Florida en trozos 170 g', 'Abarrotes', 'LAT', 4.9, 6.2, 18, 70],
  ['ABA-006', 'Avena Quaker 900 g', 'Abarrotes', 'BOL', 6.8, 8.5, 8, 30],
  ['BEB-001', 'Gaseosa Inca Kola 1.5 L', 'Bebidas', 'BOT', 5.2, 6.8, 24, 96],
  ['BEB-002', 'Gaseosa Coca-Cola 1.5 L', 'Bebidas', 'BOT', 5.2, 6.8, 24, 96],
  ['BEB-003', 'Agua San Luis sin gas 625 ml', 'Bebidas', 'BOT', 1.1, 1.8, 30, 120],
  ['BEB-004', 'Cerveza Arequipeña lata 355 ml', 'Bebidas', 'LAT', 3.4, 4.5, 36, 144],
  ['BEB-005', 'Néctar Frugos durazno 1 L', 'Bebidas', 'CAJ', 3.9, 5.2, 12, 40],
  ['LAC-001', 'Leche Gloria azul 400 g', 'Lácteos', 'LAT', 3.6, 4.4, 48, 192],
  ['LAC-002', 'Yogurt Laive fresa 1 L', 'Lácteos', 'BOT', 5.4, 6.9, 12, 36],
  ['LAC-003', 'Queso fresco Laive 500 g', 'Lácteos', 'UND', 11.5, 14.5, 6, 20],
  ['LAC-004', 'Mantequilla Gloria 200 g', 'Lácteos', 'UND', 6.9, 8.6, 6, 18],
  ['LIM-001', 'Detergente Bolívar 2.6 kg', 'Limpieza', 'BOL', 27.9, 33.9, 5, 20],
  ['LIM-002', 'Lejía Clorox 1 L', 'Limpieza', 'BOT', 3.2, 4.3, 10, 36],
  ['LIM-003', 'Papel higiénico Elite x 4', 'Limpieza', 'PAQ', 4.6, 5.9, 15, 60],
  ['LIM-004', 'Lavavajillas Ayudín 900 g', 'Limpieza', 'UND', 7.4, 9.2, 6, 24],
  ['CPE-001', 'Shampoo Head & Shoulders 375 ml', 'Cuidado personal', 'BOT', 15.9, 19.9, 4, 15],
  ['CPE-002', 'Jabón Protex avena x 3', 'Cuidado personal', 'PAQ', 7.2, 8.9, 8, 30],
  ['CPE-003', 'Pasta dental Colgate 90 g', 'Cuidado personal', 'UND', 4.1, 5.5, 10, 40],
  ['SNK-001', 'Galletas Soda Field x 6', 'Snacks', 'PAQ', 2.9, 3.8, 15, 60],
  ['SNK-002', 'Papas Lay\'s clásicas 150 g', 'Snacks', 'BOL', 5.1, 6.5, 10, 40],
  ['SNK-003', 'Chocolate Sublime 30 g', 'Snacks', 'UND', 1.3, 2.0, 30, 100],
  ['PAN-001', 'Pan de molde Bimbo blanco', 'Panadería', 'PAQ', 6.4, 8.2, 8, 24],
];

// Generador pseudoaleatorio determinista (mulberry32).
function rng(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const pad = (n) => String(n).padStart(2, '0');
function isoAt(day, hour, minute) {
  const d = new Date(day);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(hour)}:${pad(minute)}:00`;
}

/**
 * @param {Date} today fecha de referencia (por defecto, hoy)
 * @param {number} days días de historial de ventas
 */
export function buildDemoState(today = new Date(), days = 30) {
  const random = rng(20261017);
  const state = createEmptyState();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - days);
  const opening = isoAt(new Date(start.getTime() - 86400000), 8, 0);

  for (const [sku, name, category, unit, cost, price, minStock, initialStock] of CATALOG) {
    createProduct(state, { sku, name, category, unit, cost, price, minStock, initialStock }, { at: opening, user: 'admin' });
  }

  const byId = state.products;
  const methods = ['EFECTIVO', 'EFECTIVO', 'EFECTIVO', 'YAPE', 'YAPE', 'PLIN', 'TARJETA'];
  const customers = ['', '', '', '', 'Rosa Quispe', 'Juan Mamani', 'Bodega El Tambito', 'Lucía Flores'];

  for (let d = 0; d <= days; d += 1) {
    const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + d);
    const weekend = day.getDay() === 0 || day.getDay() === 6;

    // Reposición dos veces por semana (lunes y jueves) de lo que esté cerca del mínimo.
    if ((day.getDay() === 1 || day.getDay() === 4) && d > 0) {
      for (const p of byId) {
        if (p.stock <= p.minStock * 1.5) {
          registerEntry(state, { productId: p.id, qty: p.minStock * 3, unitCost: p.cost, supplier: 'Distribuidora del Sur SAC', note: 'Reposición semanal' },
            { at: isoAt(day, 8, 15), user: 'admin' });
        }
      }
    }

    const tickets = Math.floor((weekend ? 16 : 10) + random() * 8);
    let times = Array.from({ length: tickets }, () => [8 + Math.floor(random() * 13), Math.floor(random() * 60)])
      .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    // El día de hoy solo tiene ventas hasta la hora actual.
    if (d === days) times = times.filter(([h, m]) => h * 60 + m <= today.getHours() * 60 + today.getMinutes());
    for (const [hour, minute] of times) {
      const nItems = 1 + Math.floor(random() * 4);
      const items = [];
      for (let i = 0; i < nItems; i += 1) {
        const p = byId[Math.floor(random() * byId.length)];
        const qty = 1 + Math.floor(random() * (p.price < 5 ? 4 : 2));
        if (p.stock - qty > 0) items.push({ productId: p.id, qty });
      }
      if (!items.length) continue;
      try {
        registerSale(state, { items, paymentMethod: methods[Math.floor(random() * methods.length)], customer: customers[Math.floor(random() * customers.length)] },
          { at: isoAt(day, hour, minute), user: random() > 0.5 ? 'caja01' : 'caja02' });
      } catch {
        /* línea sin stock: se omite en la simulación */
      }
    }
  }
  // Casos de demostración: una anulación y un ajuste por merma.
  const lastSale = state.sales[state.sales.length - 5];
  if (lastSale) cancelSale(state, lastSale.id, 'Cliente desistió de la compra', { at: lastSale.at, user: 'admin' });
  const yogurt = state.products.find((p) => p.sku === 'LAC-002');
  if (yogurt.stock > 2) adjustStock(state, { productId: yogurt.id, countedStock: yogurt.stock - 2, reason: 'Merma: 2 unidades vencidas' }, { at: isoAt(today, 7, 50), user: 'admin' });

  return state;
}
