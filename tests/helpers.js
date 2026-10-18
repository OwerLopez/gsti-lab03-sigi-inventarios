// Datos de prueba comunes: una tienda con dos productos y stock inicial.
import { createEmptyState, createProduct } from '../js/inventory.js';

export const T = (h) => ({ at: `2026-10-10T${h}:00`, user: 'test' });

export function fixture() {
  const s = createEmptyState();
  const arroz = createProduct(s, { sku: 'aba-001', name: 'Arroz 5 kg', category: 'Abarrotes', cost: 17.5, price: 21.9, minStock: 10, initialStock: 20 }, T('08:00'));
  const leche = createProduct(s, { sku: 'LAC-001', name: 'Leche 400 g', category: 'Lácteos', cost: 3.6, price: 4.4, minStock: 5, initialStock: 6 }, T('08:00'));
  return { s, arroz, leche };
}

export const round = (n) => Math.round(n * 100) / 100;
