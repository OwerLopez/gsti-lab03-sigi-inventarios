// Pruebas de aceptación · datos-demo. Ejecutar con: npm test
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { kardex } from '../js/inventory.js';
import { buildDemoState, CATALOG } from '../js/seed.js';

describe('Datos de demostración', () => {
  test('genera catálogo completo, ventas consistentes y stock nunca negativo', () => {
    const demo = buildDemoState(new Date(2026, 9, 17));
    assert.equal(demo.products.length, CATALOG.length);
    assert.ok(demo.sales.length > 300);
    assert.ok(demo.products.every((p) => p.stock >= 0));
    for (const p of demo.products) {
      const sum = demo.movements.filter((m) => m.productId === p.id).reduce((a, m) => a + m.qty, 0);
      assert.equal(sum, p.stock, `kardex cuadra con el stock de ${p.sku}`);
    }
  });
});
