import * as inv from '../inventory.js';
import { ctx, $, esc, localStamp, commit, movRow, rerender } from '../ui.js';

/* ---- Ingresos y ajustes (HU-04, HU-06) ---- */
export function renderMovements(view) {
  const options = ctx.state.products.filter((p) => p.active).map((p) => `<option value="${p.id}">${p.sku} · ${esc(p.name)} (stock ${p.stock})</option>`).join('');
  const recent = [...ctx.state.movements].filter((m) => m.type !== 'SALIDA').reverse().slice(0, 40);
  view.innerHTML = `
    <div class="grid cols-2-eq">
      <div class="card"><h3>Ingreso de mercadería</h3>
        <form id="fin" class="form-grid">
          <label class="full">Producto<select name="productId" required>${options}</select></label>
          <label>Cantidad<input name="qty" type="number" min="1" step="1" required></label>
          <label>Costo unitario (S/)<input name="unitCost" type="number" min="0" step="0.01" placeholder="Deja vacío para usar el costo actual"></label>
          <label class="full">Proveedor<input name="supplier" placeholder="Distribuidora del Sur SAC"></label>
          <label class="full">Documento / observación<input name="note" placeholder="Guía de remisión 0012-8871"></label>
          <div class="full"><button class="btn ok">Registrar ingreso</button></div>
        </form>
      </div>
      <div class="card"><h3>Ajuste por inventario físico</h3>
        <div class="notice">El ajuste reemplaza el stock del sistema por el stock contado y deja la diferencia registrada en el kardex.</div>
        <form id="fadj" class="form-grid">
          <label class="full">Producto<select name="productId" required>${options}</select></label>
          <label>Stock contado<input name="countedStock" type="number" min="0" step="1" required></label>
          <label>Motivo<select name="reason"><option>Merma por vencimiento</option><option>Producto dañado</option><option>Diferencia de conteo</option><option>Robo o pérdida</option></select></label>
          <div class="full"><button class="btn">Registrar ajuste</button></div>
        </form>
      </div>
    </div>
    <div class="card" style="margin-top:16px"><h3>Últimos ingresos, ajustes y devoluciones</h3>
      <div class="table-wrap"><table><thead><tr><th>N.°</th><th>Fecha</th><th>Tipo</th><th>Producto</th><th class="num">Cantidad</th><th class="num">Costo unit.</th><th class="num">Saldo</th><th>Referencia / motivo</th><th>Usuario</th></tr></thead>
      <tbody>${recent.map((m) => movRow(m, true)).join('')}</tbody></table></div></div>`;

  $('#fin').onsubmit = (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    if (commit(() => inv.registerEntry(ctx.state, d, { at: localStamp() }), 'Ingreso registrado')) rerender();
  };
  $('#fadj').onsubmit = (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    if (commit(() => inv.adjustStock(ctx.state, d, { at: localStamp() }), (m) => `Ajuste registrado (${m.qty > 0 ? '+' : ''}${m.qty})`)) rerender();
  };
}
