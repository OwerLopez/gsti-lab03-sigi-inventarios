// Pruebas de aceptación · sprint3-reportes. Ejecutar con: npm test
import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { cancelSale, dashboard, inventoryValuation, registerSale, salesByDay, salesByPaymentMethod, toCSV, topProducts } from '../js/inventory.js';
import { fixture, round } from './helpers.js';

let s;
let arroz;
let leche;
beforeEach(() => ({ s, arroz, leche } = fixture()));

describe('Sprint 3 · Reportes', () => {
  beforeEach(() => {
    registerSale(s, { items: [{ productId: arroz.id, qty: 1 }], paymentMethod: 'YAPE' }, { at: '2026-10-15T10:00:00' });
    registerSale(s, { items: [{ productId: leche.id, qty: 3 }] }, { at: '2026-10-15T11:00:00' });
    registerSale(s, { items: [{ productId: leche.id, qty: 1 }, { productId: arroz.id, qty: 2 }], paymentMethod: 'TARJETA' }, { at: '2026-10-16T09:00:00' });
  });

  test('HU-14: ventas por día dentro del rango', () => {
    const r = salesByDay(s, { from: '2026-10-15', to: '2026-10-16' });
    assert.deepEqual(r.map((x) => [x.day, x.tickets, x.total]), [['2026-10-15', 2, 35.1], ['2026-10-16', 1, 48.2]]);
  });

  test('HU-15: productos más vendidos ordenados por unidades', () => {
    const top = topProducts(s);
    assert.equal(top[0].sku, 'LAC-001');
    assert.equal(top[0].units, 4);
    assert.equal(top[1].units, 3);
  });

  test('HU-15: las ventas anuladas no cuentan en los reportes', () => {
    cancelSale(s, s.sales[2].id, 'prueba');
    assert.equal(salesByDay(s).length, 1);
  });

  test('HU-16: inventario valorizado al costo y al precio', () => {
    const v = inventoryValuation(s);
    assert.equal(v.totalCost, round(17 * 17.5 + 2 * 3.6));
    assert.ok(v.byCategory.Abarrotes > 0);
  });

  test('HU-13: dashboard y reporte por método de pago', () => {
    const d = dashboard(s, '2026-10-16');
    assert.equal(d.ticketsToday, 1);
    assert.equal(d.salesMonth, 83.3);
    const pm = salesByPaymentMethod(s);
    assert.equal(pm.find((x) => x.method === 'YAPE').tickets, 1);
  });

  test('HU-17: CSV con separador ; y comillas escapadas', () => {
    const csv = toCSV([{ a: 'x;y', b: 'dijo "hola"' }], [{ label: 'A', key: 'a' }, { label: 'B', key: 'b' }]);
    assert.equal(csv, 'A;B\r\n"x;y";"dijo ""hola"""');
  });
});
