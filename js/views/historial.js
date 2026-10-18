import * as inv from '../inventory.js';
import { ctx, $, money, esc, fmtDateTime, todayISO, daysAgo, localStamp, commit, openModal, closeModal, showReceipt } from '../ui.js';

/* ---- Historial de ventas (HU-09, HU-12) ---- */
export function renderHistory(view) {
  view.innerHTML = `
    <div class="toolbar">
      <label>Desde<input type="date" id="hf" value="${daysAgo(6)}"></label><label>Hasta<input type="date" id="ht" value="${todayISO()}"></label>
      <label>Método<select id="hm"><option value="">Todos</option>${Object.entries(inv.PAYMENT_METHODS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>
      <label>Estado<select id="hs"><option value="">Todos</option><option>EMITIDA</option><option>ANULADA</option></select></label>
      <span class="spacer"></span><div id="hsum" class="muted"></div>
    </div>
    <div class="card" style="padding:0"><div class="table-wrap" style="border:0"><table><thead><tr><th>Comprobante</th><th>Fecha</th><th>Cliente</th><th>Cajero</th><th>Pago</th><th class="num">Ítems</th><th class="num">Total</th><th>Estado</th><th></th></tr></thead><tbody id="hrows"></tbody></table></div></div>`;
  const draw = () => {
    const f = $('#hf').value; const t = $('#ht').value; const m = $('#hm').value; const st = $('#hs').value;
    const list = ctx.state.sales.filter((s) => s.at.slice(0, 10) >= f && s.at.slice(0, 10) <= t && (!m || s.paymentMethod === m) && (!st || s.status === st)).reverse();
    const valid = list.filter((s) => s.status === 'EMITIDA');
    $('#hsum').innerHTML = `${list.length} comprobantes · total emitido <b>${money(valid.reduce((a, s) => a + s.total, 0))}</b>`;
    $('#hrows').innerHTML = list.map((s) => `<tr class="${s.status === 'ANULADA' ? 'off' : ''}"><td><code>${s.id}</code></td><td>${fmtDateTime(s.at)}</td><td>${esc(s.customer)}</td><td>${s.user}</td>
      <td>${inv.PAYMENT_METHODS[s.paymentMethod]}</td><td class="num">${s.lines.reduce((a, l) => a + l.qty, 0)}</td><td class="num">${money(s.total)}</td>
      <td>${s.status === 'EMITIDA' ? '<span class="badge ok">Emitida</span>' : '<span class="badge bad">Anulada</span>'}</td>
      <td><button class="link" data-view="${s.id}">Ver</button>${s.status === 'EMITIDA' ? `<button class="link" data-cancel="${s.id}" style="color:var(--bad)">Anular</button>` : ''}</td></tr>`).join('')
      || '<tr><td colspan="9" class="empty">No hay ventas en el rango seleccionado.</td></tr>';
  };
  ['#hf', '#ht', '#hm', '#hs'].forEach((s) => $(s).addEventListener('input', draw));
  $('#hrows').onclick = (e) => {
    const sale = ctx.state.sales.find((s) => s.id === (e.target.dataset.view || e.target.dataset.cancel));
    if (!sale) return;
    if (e.target.dataset.view) return showReceipt(sale);
    openModal(`Anular ${sale.id}`, `<p>Se anulará la venta por <b>${money(sale.total)}</b> y se devolverán <b>${sale.lines.reduce((a, l) => a + l.qty, 0)}</b> unidades al stock.</p>
      <form id="cf"><label>Motivo de anulación<input name="reason" required placeholder="Error en el cobro"></label>
      <div class="actions"><button type="button" class="btn secondary" data-close>Volver</button><button class="btn danger">Anular venta</button></div></form>`, (root) => {
      $('#cf', root).onsubmit = (ev) => {
        ev.preventDefault();
        if (commit(() => inv.cancelSale(ctx.state, sale.id, ev.target.reason.value, { at: localStamp() }), `Venta ${sale.id} anulada; stock devuelto`)) { closeModal(); draw(); }
      };
    });
  };
  draw();
}
