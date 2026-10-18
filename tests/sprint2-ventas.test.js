// Pruebas de aceptación · sprint2-ventas. Ejecutar con: npm test
import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { cancelSale, computeTotals, registerSale } from '../js/inventory.js';
import { fixture, T } from './helpers.js';

let s;
let arroz;
let leche;
beforeEach(() => ({ s, arroz, leche } = fixture()));

describe('Sprint 2 · Registro de ventas', () => {
  test('HU-07: registra la venta, descuenta stock y calcula IGV incluido', () => {
    const sale = registerSale(s, { items: [{ productId: arroz.id, qty: 2 }, { productId: leche.id, qty: 1 }], amountReceived: 50 }, T('12:00'));
    assert.equal(sale.total, 48.2);
    assert.equal(sale.subtotal, 40.85);
    assert.equal(sale.igv, 7.35);
    assert.equal(sale.change, 1.8);
    assert.equal(arroz.stock, 18);
    assert.equal(sale.id, 'B001-000001');
  });

  test('HU-08: no permite vender más de lo disponible y no mueve stock parcial', () => {
    assert.throws(() => registerSale(s, { items: [{ productId: arroz.id, qty: 1 }, { productId: leche.id, qty: 7 }] }), /Stock insuficiente/);
    assert.equal(arroz.stock, 20);
    assert.equal(s.sales.length, 0);
  });

  test('HU-08: agrupa líneas repetidas del mismo producto antes de validar', () => {
    assert.throws(() => registerSale(s, { items: [{ productId: leche.id, qty: 4 }, { productId: leche.id, qty: 3 }] }), /solicitado 7/);
  });

  test('HU-09: anular una venta devuelve el stock y no se puede anular dos veces', () => {
    const sale = registerSale(s, { items: [{ productId: leche.id, qty: 3 }] }, T('13:00'));
    cancelSale(s, sale.id, 'Error de digitación', T('13:05'));
    assert.equal(leche.stock, 6);
    assert.equal(sale.status, 'ANULADA');
    assert.throws(() => cancelSale(s, sale.id, 'otra vez'), /ya fue anulada/);
  });

  test('HU-11 (cambio del cliente): acepta Yape/Plin/Tarjeta y rechaza métodos desconocidos', () => {
    const y = registerSale(s, { items: [{ productId: leche.id, qty: 1 }], paymentMethod: 'YAPE' }, T('14:00'));
    assert.equal(y.paymentMethod, 'YAPE');
    assert.equal(y.change, 0);
    assert.throws(() => registerSale(s, { items: [{ productId: leche.id, qty: 1 }], paymentMethod: 'BITCOIN' }), /Método de pago/);
  });

  test('HU-07: en efectivo exige monto recibido suficiente', () => {
    assert.throws(() => registerSale(s, { items: [{ productId: arroz.id, qty: 1 }], amountReceived: 20 }), /insuficiente/);
  });

  test('computeTotals redondea a céntimos', () => {
    assert.deepEqual(computeTotals([{ qty: 3, price: 1.1 }]), { subtotal: 2.8, igv: 0.5, total: 3.3 });
  });
});
