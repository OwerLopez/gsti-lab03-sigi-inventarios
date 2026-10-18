import * as inv from '../inventory.js';
import { ctx, $, $$, money, esc, localStamp, commit, toast, stockBadge, showReceipt } from '../ui.js';

const cart = { lines: [], method: 'EFECTIVO' };

/* ---- Punto de venta (HU-07, HU-08, HU-10, HU-11) ---- */
export function renderPOS(view) {
  view.innerHTML = `
    <div class="grid pos">
      <div class="card">
        <div class="toolbar"><input id="pq" type="search" placeholder="Buscar producto por nombre o código…" style="flex:1" autofocus>
          <select id="pc"><option value="">Todas</option>${ctx.state.categories.map((c) => `<option>${esc(c)}</option>`).join('')}</select></div>
        <div class="product-list" id="plist"></div>
      </div>
      <div class="card">
        <h3>Venta actual <button class="link" id="clear">Vaciar</button></h3>
        <div id="cartLines"></div>
        <div class="totals" id="totals"></div>
        <label>Cliente (opcional)<input id="cust" placeholder="Cliente varios"></label>
        <p style="margin:12px 0 0;font-weight:600;font-size:12px;color:#3a4659">Método de pago</p>
        <div class="pay-methods" id="pm">${Object.entries(inv.PAYMENT_METHODS).map(([k, v]) => `<button data-m="${k}" class="${cart.method === k ? 'active' : ''}">${v}</button>`).join('')}</div>
        <div id="cashBox"><label>Monto recibido (S/)<input id="recv" type="number" min="0" step="0.10"></label><p class="muted" id="change"></p></div>
        <button class="btn lg ok" id="pay" style="margin-top:10px">Cobrar y emitir boleta</button>
      </div>
    </div>`;

  const drawProducts = () => {
    const list = inv.searchProducts(ctx.state, { text: $('#pq').value, category: $('#pc').value, onlyActive: true });
    $('#plist').innerHTML = list.map((p) => `<button class="product-tile" data-add="${p.id}" ${p.stock === 0 ? 'disabled' : ''}>
      <span class="name">${esc(p.name)}</span><span class="meta"><span>${p.sku}</span>${stockBadge(p)}</span><span class="price">${money(p.price)}</span></button>`).join('')
      || '<p class="empty">Sin resultados</p>';
  };
  const drawCart = () => {
    const lines = cart.lines.map((l) => ({ ...l, product: inv.findProduct(ctx.state, l.productId) }));
    $('#cartLines').innerHTML = lines.map((l, i) => `<div class="cart-line"><div><b>${esc(l.product.name)}</b><br><small class="muted">${money(l.product.price)} c/u · disp. ${l.product.stock}</small></div>
      <div class="qty"><button data-dec="${i}">−</button><input data-q="${i}" value="${l.qty}"><button data-inc="${i}">+</button></div>
      <div class="num">${money(l.qty * l.product.price)}</div><button class="btn-icon" data-del="${i}" title="Quitar">✕</button></div>`).join('')
      || '<p class="empty">Selecciona productos de la lista para agregarlos.</p>';
    const t = inv.computeTotals(lines.map((l) => ({ qty: l.qty, price: l.product.price })));
    $('#totals').innerHTML = `<div><span>Op. gravada</span><span>${money(t.subtotal)}</span></div><div><span>IGV (18 %)</span><span>${money(t.igv)}</span></div><div class="grand"><span>Total</span><span>${money(t.total)}</span></div>`;
    $('#cashBox').hidden = cart.method !== 'EFECTIVO';
    const recv = Number($('#recv').value || 0);
    $('#change').textContent = recv ? (recv >= t.total ? `Vuelto: ${money(recv - t.total)}` : `Falta: ${money(t.total - recv)}`) : '';
    $('#pay').disabled = !lines.length;
    return t;
  };

  $('#pq').oninput = drawProducts;
  $('#pc').onchange = drawProducts;
  $('#recv').oninput = drawCart;
  $('#plist').onclick = (e) => {
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    const line = cart.lines.find((l) => l.productId === btn.dataset.add);
    const p = inv.findProduct(ctx.state, btn.dataset.add);
    const current = line ? line.qty : 0;
    if (current + 1 > p.stock) return toast(`Stock insuficiente de "${p.name}" (disponible ${p.stock}).`, 'error');
    if (line) line.qty += 1; else cart.lines.push({ productId: p.id, qty: 1 });
    drawCart();
  };
  $('#cartLines').onclick = (e) => {
    const d = e.target.dataset;
    if (d.inc) cart.lines[d.inc].qty += 1;
    if (d.dec) cart.lines[d.dec].qty = Math.max(1, cart.lines[d.dec].qty - 1);
    if (d.del) cart.lines.splice(d.del, 1);
    drawCart();
  };
  $('#cartLines').onchange = (e) => {
    if (e.target.dataset.q) cart.lines[e.target.dataset.q].qty = Math.max(1, parseInt(e.target.value, 10) || 1);
    drawCart();
  };
  $('#pm').onclick = (e) => {
    if (!e.target.dataset.m) return;
    cart.method = e.target.dataset.m;
    $$('#pm button').forEach((b) => b.classList.toggle('active', b.dataset.m === cart.method));
    drawCart();
  };
  $('#clear').onclick = () => { cart.lines = []; drawCart(); };
  $('#pay').onclick = () => {
    const sale = commit(() => inv.registerSale(ctx.state, {
      items: cart.lines, paymentMethod: cart.method, customer: $('#cust').value,
      amountReceived: cart.method === 'EFECTIVO' ? $('#recv').value : undefined,
    }, { at: localStamp(), user: 'caja01' }), (s) => `Venta ${s.id} registrada por ${money(s.total)}`);
    if (sale) {
      cart.lines = [];
      $('#recv').value = '';
      $('#cust').value = '';
      drawProducts();
      drawCart();
      showReceipt(sale);
    }
  };
  drawProducts();
  drawCart();
}
