import * as inv from '../inventory.js';
import { ctx, $, money, esc, todayISO, localStamp, commit, openModal, closeModal, stockBadge, downloadCSV, rerender } from '../ui.js';

/* ---- Productos (HU-01, HU-02, HU-03, HU-05) ---- */
export function renderProducts(view, params) {
  view.innerHTML = `
    <div class="toolbar">
      <input id="q" type="search" placeholder="Buscar por nombre o código…" style="width:280px">
      <select id="cat"><option value="">Todas las categorías</option>${ctx.state.categories.map((c) => `<option>${esc(c)}</option>`).join('')}</select>
      <label class="check"><input type="checkbox" id="low" ${params.get('bajo') ? 'checked' : ''}> Solo stock bajo</label>
      <label class="check"><input type="checkbox" id="inact"> Mostrar inactivos</label>
      <span class="spacer"></span>
      <button class="btn secondary" id="csv">Exportar CSV</button>
      <button class="btn" id="new">+ Nuevo producto</button>
    </div>
    <div class="card" style="padding:0"><div class="table-wrap" style="border:0">
      <table><thead><tr><th>Código</th><th>Producto</th><th>Categoría</th><th>Und.</th><th class="num">Costo</th><th class="num">Precio</th><th class="num">Margen</th><th class="num">Stock</th><th class="num">Mín.</th><th>Acciones</th></tr></thead>
      <tbody id="rows"></tbody></table></div></div>`;

  const draw = () => {
    const list = inv.searchProducts(ctx.state, { text: $('#q').value, category: $('#cat').value, onlyLow: $('#low').checked })
      .filter((p) => $('#inact').checked || p.active);
    $('#rows').innerHTML = list.map((p) => {
      const margin = p.price ? ((p.price / (1 + inv.IGV) - p.cost) / (p.price / (1 + inv.IGV))) * 100 : 0;
      return `<tr class="${p.active ? '' : 'off'}">
        <td><code>${p.sku}</code></td><td>${esc(p.name)}</td><td>${esc(p.category)}</td><td>${p.unit}</td>
        <td class="num">${money(p.cost)}</td><td class="num">${money(p.price)}</td><td class="num">${margin.toFixed(1)}%</td>
        <td class="num">${stockBadge(p)}</td><td class="num">${p.minStock}</td>
        <td><button class="link" data-edit="${p.id}">Editar</button><button class="link" data-in="${p.id}">Ingreso</button><a class="link" href="#/kardex?id=${p.id}">Kardex</a><button class="link" data-toggle="${p.id}">${p.active ? 'Desactivar' : 'Activar'}</button></td></tr>`;
    }).join('') || '<tr><td colspan="10" class="empty">No hay productos que coincidan con el filtro.</td></tr>';
  };
  ['#q', '#cat', '#low', '#inact'].forEach((s) => $(s).addEventListener('input', draw));
  draw();

  $('#new').onclick = () => productForm();
  $('#csv').onclick = () => downloadCSV(`productos_${todayISO()}.csv`, ctx.state.products, [
    { label: 'Código', key: 'sku' }, { label: 'Producto', key: 'name' }, { label: 'Categoría', key: 'category' }, { label: 'Unidad', key: 'unit' },
    { label: 'Costo', key: 'cost' }, { label: 'Precio', key: 'price' }, { label: 'Stock', key: 'stock' }, { label: 'Stock mínimo', key: 'minStock' },
    { label: 'Estado', value: (p) => (p.active ? 'Activo' : 'Inactivo') }]);
  $('#rows').addEventListener('click', (e) => {
    const t = e.target;
    if (t.dataset.edit) productForm(inv.findProduct(ctx.state, t.dataset.edit));
    if (t.dataset.in) entryForm(t.dataset.in);
    if (t.dataset.toggle) {
      const p = inv.findProduct(ctx.state, t.dataset.toggle);
      commit(() => inv.setProductActive(ctx.state, p.id, !p.active), `${p.name}: ${p.active ? 'desactivado' : 'activado'}`);
      draw();
    }
  });
}

function productForm(p) {
  const editing = Boolean(p);
  openModal(editing ? `Editar producto ${p.sku}` : 'Nuevo producto', `
    <form id="pf" class="form-grid">
      <label>Código (SKU)<input name="sku" required value="${esc(p?.sku || '')}" ${editing ? 'disabled' : ''} placeholder="ABA-010"></label>
      <label>Categoría<input name="category" list="cats" required value="${esc(p?.category || '')}"><datalist id="cats">${ctx.state.categories.map((c) => `<option>${esc(c)}</option>`).join('')}</datalist></label>
      <label class="full">Nombre del producto<input name="name" required value="${esc(p?.name || '')}"></label>
      <label>Unidad de medida<select name="unit">${['UND', 'BOL', 'BOT', 'LAT', 'PAQ', 'CAJ', 'KG'].map((u) => `<option ${p?.unit === u ? 'selected' : ''}>${u}</option>`).join('')}</select></label>
      <label>Stock mínimo<input name="minStock" type="number" min="0" step="1" required value="${p?.minStock ?? 5}"></label>
      <label>Costo unitario (S/)<input name="cost" type="number" min="0" step="0.01" required value="${p?.cost ?? ''}"></label>
      <label>Precio de venta con IGV (S/)<input name="price" type="number" min="0.01" step="0.01" required value="${p?.price ?? ''}"></label>
      ${editing ? '' : '<label>Stock inicial<input name="initialStock" type="number" min="0" step="1" value="0"></label>'}
      <div class="full actions"><button type="button" class="btn secondary" data-close>Cancelar</button><button class="btn">${editing ? 'Guardar cambios' : 'Registrar producto'}</button></div>
    </form>`, (root) => {
    $('#pf', root).onsubmit = (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target));
      const ok = editing
        ? commit(() => inv.updateProduct(ctx.state, p.id, data), 'Producto actualizado')
        : commit(() => inv.createProduct(ctx.state, data, { at: localStamp() }), (r) => `Producto ${r.sku} registrado`);
      if (ok) { closeModal(); rerender(); }
    };
  });
}

function entryForm(productId) {
  const p = inv.findProduct(ctx.state, productId);
  openModal(`Ingreso de mercadería · ${p.sku}`, `
    <p class="muted" style="margin-bottom:12px">${esc(p.name)} — stock actual <b>${p.stock}</b>, costo promedio <b>${money(p.cost)}</b></p>
    <form id="ef" class="form-grid">
      <label>Cantidad<input name="qty" type="number" min="1" step="1" required autofocus></label>
      <label>Costo unitario (S/)<input name="unitCost" type="number" min="0" step="0.01" value="${p.cost}"></label>
      <label class="full">Proveedor<input name="supplier" placeholder="Distribuidora del Sur SAC"></label>
      <label class="full">Observación<input name="note" placeholder="Factura F001-2345"></label>
      <div class="full actions"><button type="button" class="btn secondary" data-close>Cancelar</button><button class="btn ok">Registrar ingreso</button></div>
    </form>`, (root) => {
    $('#ef', root).onsubmit = (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target));
      if (commit(() => inv.registerEntry(ctx.state, { productId, ...d }, { at: localStamp() }), `Ingreso registrado: +${d.qty} ${p.unit}`)) { closeModal(); rerender(); }
    };
  });
}
