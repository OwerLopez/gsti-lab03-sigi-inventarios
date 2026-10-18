import * as inv from '../inventory.js';
import { ctx, $, esc, downloadCSV, kpi, movRow } from '../ui.js';

/* ---- Kardex (HU-06) ---- */
export function renderKardex(view, params) {
  const id = params.get('id') || ctx.state.products[0]?.id;
  view.innerHTML = `
    <div class="toolbar"><select id="kp" style="min-width:360px">${ctx.state.products.map((p) => `<option value="${p.id}" ${p.id === id ? 'selected' : ''}>${p.sku} · ${esc(p.name)}</option>`).join('')}</select>
      <span class="spacer"></span><button class="btn secondary" id="kcsv">Exportar CSV</button></div>
    <div id="ksum" class="grid kpis" style="margin-bottom:16px"></div>
    <div class="card" style="padding:0"><div class="table-wrap" style="border:0"><table><thead><tr><th>N.°</th><th>Fecha</th><th>Tipo</th><th class="num">Cantidad</th><th class="num">Costo unit.</th><th class="num">Saldo</th><th>Referencia / motivo</th><th>Usuario</th></tr></thead><tbody id="krows"></tbody></table></div></div>`;
  const draw = () => {
    const pid = $('#kp').value;
    const p = inv.findProduct(ctx.state, pid);
    const rows = inv.kardex(ctx.state, pid);
    const sum = (t) => rows.filter((m) => m.type === t).reduce((a, m) => a + Math.abs(m.qty), 0);
    $('#ksum').innerHTML = kpi('Stock actual', p.stock, `mínimo ${p.minStock}`, p.stock <= p.minStock) + kpi('Ingresos', sum('INGRESO'), 'unidades') + kpi('Salidas por venta', sum('SALIDA'), 'unidades') + kpi('Ajustes / devoluciones', sum('AJUSTE') + sum('DEVOLUCION'), 'unidades');
    $('#krows').innerHTML = [...rows].reverse().map((m) => movRow(m, false)).join('');
    history.replaceState(null, '', `#/kardex?id=${pid}`);
  };
  $('#kp').onchange = draw;
  $('#kcsv').onclick = () => downloadCSV(`kardex_${$('#kp').value}.csv`, inv.kardex(ctx.state, $('#kp').value), [
    { label: 'N°', key: 'id' }, { label: 'Fecha', key: 'at' }, { label: 'Tipo', key: 'type' }, { label: 'Cantidad', key: 'qty' },
    { label: 'Costo unitario', key: 'unitCost' }, { label: 'Saldo', key: 'balance' }, { label: 'Referencia', key: 'reference' }, { label: 'Motivo', key: 'note' }, { label: 'Usuario', key: 'user' }]);
  draw();
}
