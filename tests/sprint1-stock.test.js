// Pruebas de aceptación · sprint1-stock. Ejecutar con: npm test
import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { DomainError, createProduct, kardex, lowStockProducts, registerEntry, searchProducts, setProductActive, updateProduct } from '../js/inventory.js';
import { fixture, T } from './helpers.js';

let s;
let arroz;
let leche;
beforeEach(() => ({ s, arroz, leche } = fixture()));

describe('Sprint 1 · Control de stock', () => {
  test('HU-01: registra producto con SKU en mayúsculas y stock inicial como ingreso', () => {
    assert.equal(arroz.sku, 'ABA-001');
    assert.equal(arroz.stock, 20);
    assert.equal(kardex(s, arroz.id)[0].type, 'INGRESO');
  });

  test('HU-01: rechaza SKU duplicado y precio menor que el costo', () => {
    assert.throws(() => createProduct(s, { sku: 'ABA-001', name: 'Otro', cost: 1, price: 2 }), DomainError);
    assert.throws(() => createProduct(s, { sku: 'X-1', name: 'Malo', cost: 10, price: 8 }), /precio de venta/);
  });

  test('HU-02: edita y desactiva productos; un producto inactivo no recibe ingresos', () => {
    updateProduct(s, arroz.id, { price: 22.5 });
    assert.equal(arroz.price, 22.5);
    setProductActive(s, arroz.id, false);
    assert.throws(() => registerEntry(s, { productId: arroz.id, qty: 5 }), /desactivado/);
  });

  test('HU-03: busca por nombre, SKU y categoría', () => {
    assert.equal(searchProducts(s, { text: 'lech' }).length, 1);
    assert.equal(searchProducts(s, { text: 'aba-' }).length, 1);
    assert.equal(searchProducts(s, { category: 'Lácteos' })[0].id, leche.id);
  });

  test('HU-04: el ingreso suma stock y recalcula el costo promedio ponderado', () => {
    registerEntry(s, { productId: arroz.id, qty: 20, unitCost: 18.5 }, T('09:00'));
    assert.equal(arroz.stock, 40);
    assert.equal(arroz.cost, 18); // (20*17.5 + 20*18.5) / 40
  });

  test('HU-05: alerta de stock mínimo con cantidad sugerida a pedir', () => {
    const low = lowStockProducts(s);
    assert.equal(low.length, 0);
    updateProduct(s, leche.id, { minStock: 8 });
    const after = lowStockProducts(s);
    assert.equal(after.length, 1);
    assert.equal(after[0].sku, 'LAC-001');
    assert.equal(after[0].toOrder, 10); // 2*8 - 6
  });

  test('HU-05: un producto desactivado no genera alerta', () => {
    updateProduct(s, leche.id, { minStock: 8 });
    setProductActive(s, leche.id, false);
    assert.equal(lowStockProducts(s).length, 0);
  });

  test('HU-06: el kardex registra cada ingreso con su saldo acumulado', () => {
    registerEntry(s, { productId: leche.id, qty: 10, unitCost: 3.8, supplier: 'Gloria' }, T('09:30'));
    const k = kardex(s, leche.id);
    assert.deepEqual(k.map((m) => [m.type, m.qty, m.balance]), [['INGRESO', 6, 6], ['INGRESO', 10, 16]]);
    assert.equal(k[1].reference, 'Prov.: Gloria');
  });
});
