import * as inv from '../inventory.js';
import { ctx, $, money, esc, fmtDate, todayISO, daysAgo, stockBadge, downloadCSV, chart, palette, kpi } from '../ui.js';

/* ---- Reportes (HU-14 a HU-17) ---- */
export function renderReports(view, params) {
  const tab = params.get('tab') || 'ventas';
  view.innerHTML = `
    <div class="tabs" id="tabs">${[['ventas', 'Ventas por día'], ['top', 'Más vendidos'], ['pagos', 'Métodos de pago'], ['valorizado', 'Inventario valorizado'], ['reposicion', 'Reposición']]
      .map(([k, v]) => `<button data-tab="${k}" class="${k === tab ? 'active' : ''}">${v}</button>`).join('')}</div>
    <div class="toolbar no-print"><label>Desde<input type="date" id="rf" value="${params.get('desde') || daysAgo(29)}"></label><label>Hasta<input type="date" id="rt" value="${params.get('hasta') || todayISO()}"></label>
      <span class="spacer"></span><button class="btn secondary" id="rprint">Imprimir / PDF</button><button class="btn" id="rcsv">Exportar CSV</button></div>
    <div id="rbody" class="print-area"></div>`;
  $('#tabs').onclick = (e) => { if (e.target.dataset.tab) location.hash = `#/reportes?tab=${e.target.dataset.tab}&desde=${$('#rf').value}&hasta=${$('#rt').value}`; };
  ['#rf', '#rt'].forEach((s) => $(s).addEventListener('change', () => { location.hash = `#/reportes?tab=${tab}&desde=${$('#rf').value}&hasta=${$('#rt').value}`; }));
  $('#rprint').onclick = () => window.print();
  const range = { from: $('#rf').value, to: $('#rt').value };
  const body = $('#rbody');
  const header = (t) => `<h3 style="margin-bottom:4px">${t}</h3><p class="muted" style="margin-bottom:14px">${esc(ctx.state.settings.storeName)} · del ${fmtDate(range.from)} al ${fmtDate(range.to)}</p>`;
  let csv = () => {};

  if (tab === 'ventas') {
    const rows = inv.salesByDay(ctx.state, range);
    const total = rows.reduce((a, r) => a + r.total, 0);
    const tickets = rows.reduce((a, r) => a + r.tickets, 0);
    body.innerHTML = `<div class="card">${header('Reporte de ventas por día')}
      <div class="grid kpis" style="margin-bottom:14px">${kpi('Total vendido', money(total), 'comprobantes emitidos')}${kpi('Comprobantes', tickets, 'en el período')}${kpi('Ticket promedio', money(tickets ? total / tickets : 0), '')}${kpi('Promedio diario', money(rows.length ? total / rows.length : 0), `${rows.length} días con ventas`)}</div>
      <div class="chart-box"><canvas id="c1"></canvas></div>
      <div class="table-wrap" style="margin-top:14px"><table><thead><tr><th>Fecha</th><th class="num">Comprobantes</th><th class="num">Total</th><th class="num">Ticket promedio</th></tr></thead>
      <tbody>${rows.map((r) => `<tr><td>${fmtDate(r.day)}</td><td class="num">${r.tickets}</td><td class="num">${money(r.total)}</td><td class="num">${money(r.total / r.tickets)}</td></tr>`).join('')}</tbody></table></div></div>`;
    chart($('#c1'), { type: 'line', data: { labels: rows.map((r) => fmtDate(r.day).slice(0, 5)), datasets: [{ label: 'Ventas (S/)', data: rows.map((r) => r.total), borderColor: '#2563b0', backgroundColor: 'rgba(37,99,176,.12)', fill: true, tension: 0.3 }] }, options: { maintainAspectRatio: false, plugins: { legend: { display: false } } } });
    csv = () => downloadCSV(`ventas_por_dia_${range.from}_${range.to}.csv`, rows, [{ label: 'Fecha', key: 'day' }, { label: 'Comprobantes', key: 'tickets' }, { label: 'Total S/', key: 'total' }]);
  }
  if (tab === 'top') {
    const rows = inv.topProducts(ctx.state, { ...range, limit: 15 });
    body.innerHTML = `<div class="card">${header('Productos más vendidos')}<div class="chart-box" style="height:320px"><canvas id="c2"></canvas></div>
      <div class="table-wrap" style="margin-top:14px"><table><thead><tr><th>#</th><th>Código</th><th>Producto</th><th class="num">Unidades</th><th class="num">Ventas</th><th class="num">Margen bruto</th></tr></thead>
      <tbody>${rows.map((r, i) => `<tr><td>${i + 1}</td><td><code>${r.sku}</code></td><td>${esc(r.name)}</td><td class="num">${r.units}</td><td class="num">${money(r.revenue)}</td><td class="num">${money(r.margin)}</td></tr>`).join('')}</tbody></table></div></div>`;
    chart($('#c2'), { type: 'bar', data: { labels: rows.slice(0, 10).map((r) => r.name.slice(0, 26)), datasets: [{ label: 'Unidades', data: rows.slice(0, 10).map((r) => r.units), backgroundColor: '#15803d', borderRadius: 6 }] }, options: { indexAxis: 'y', maintainAspectRatio: false, plugins: { legend: { display: false } } } });
    csv = () => downloadCSV(`mas_vendidos_${range.from}_${range.to}.csv`, rows, [{ label: 'Código', key: 'sku' }, { label: 'Producto', key: 'name' }, { label: 'Unidades', key: 'units' }, { label: 'Ventas S/', key: 'revenue' }, { label: 'Margen S/', key: 'margin' }]);
  }
  if (tab === 'pagos') {
    const rows = inv.salesByPaymentMethod(ctx.state, range);
    const total = rows.reduce((a, r) => a + r.total, 0);
    body.innerHTML = `<div class="card">${header('Ventas por método de pago (cierre de caja)')}<div class="grid cols-2-eq"><div class="chart-box"><canvas id="c3"></canvas></div>
      <table><thead><tr><th>Método</th><th class="num">Comprobantes</th><th class="num">Total</th><th class="num">%</th></tr></thead>
      <tbody>${rows.map((r) => `<tr><td>${r.label}</td><td class="num">${r.tickets}</td><td class="num">${money(r.total)}</td><td class="num">${total ? ((r.total / total) * 100).toFixed(1) : 0}%</td></tr>`).join('')}
      <tr><td><b>Total</b></td><td class="num"><b>${rows.reduce((a, r) => a + r.tickets, 0)}</b></td><td class="num"><b>${money(total)}</b></td><td class="num">100%</td></tr></tbody></table></div></div>`;
    chart($('#c3'), { type: 'pie', data: { labels: rows.map((r) => r.label), datasets: [{ data: rows.map((r) => r.total), backgroundColor: palette }] }, options: { maintainAspectRatio: false } });
    csv = () => downloadCSV(`metodos_pago_${range.from}_${range.to}.csv`, rows, [{ label: 'Método', key: 'label' }, { label: 'Comprobantes', key: 'tickets' }, { label: 'Total S/', key: 'total' }]);
  }
  if (tab === 'valorizado') {
    const v = inv.inventoryValuation(ctx.state);
    body.innerHTML = `<div class="card">${header('Inventario valorizado (al costo promedio y al precio de venta)')}
      <div class="grid kpis" style="margin-bottom:14px">${kpi('Valor al costo', money(v.totalCost), 'capital inmovilizado')}${kpi('Valor a precio de venta', money(v.totalPrice), 'con IGV')}${kpi('Utilidad potencial', money(v.totalPrice / (1 + inv.IGV) - v.totalCost), 'sin IGV')}</div>
      <div class="grid cols-2"><div class="table-wrap"><table><thead><tr><th>Código</th><th>Producto</th><th class="num">Stock</th><th class="num">Costo</th><th class="num">Valor costo</th><th class="num">Valor venta</th></tr></thead>
      <tbody>${v.rows.map((r) => `<tr><td><code>${r.sku}</code></td><td>${esc(r.name)}</td><td class="num">${r.stock}</td><td class="num">${money(r.cost)}</td><td class="num">${money(r.valueCost)}</td><td class="num">${money(r.valuePrice)}</td></tr>`).join('')}</tbody></table></div>
      <div class="chart-box" style="height:320px"><canvas id="c4"></canvas></div></div></div>`;
    chart($('#c4'), { type: 'doughnut', data: { labels: Object.keys(v.byCategory), datasets: [{ data: Object.values(v.byCategory), backgroundColor: palette }] }, options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom' }, title: { display: true, text: 'Valor al costo por categoría' } } } });
    csv = () => downloadCSV(`inventario_valorizado_${todayISO()}.csv`, v.rows, [{ label: 'Código', key: 'sku' }, { label: 'Producto', key: 'name' }, { label: 'Categoría', key: 'category' }, { label: 'Stock', key: 'stock' }, { label: 'Costo', key: 'cost' }, { label: 'Valor costo', key: 'valueCost' }, { label: 'Valor venta', key: 'valuePrice' }]);
  }
  if (tab === 'reposicion') {
    const rows = inv.lowStockProducts(ctx.state);
    body.innerHTML = `<div class="card">${header('Lista de reposición (productos en o bajo el stock mínimo)')}
      <div class="table-wrap"><table><thead><tr><th>Código</th><th>Producto</th><th>Categoría</th><th class="num">Stock</th><th class="num">Mínimo</th><th class="num">Cantidad sugerida</th><th class="num">Costo estimado</th></tr></thead>
      <tbody>${rows.map((r) => `<tr><td><code>${r.sku}</code></td><td>${esc(r.name)}</td><td>${esc(r.category)}</td><td class="num">${stockBadge(r)}</td><td class="num">${r.minStock}</td><td class="num"><b>${r.toOrder}</b></td><td class="num">${money(r.toOrder * r.cost)}</td></tr>`).join('') || '<tr><td colspan="7" class="empty">No hay productos por reponer.</td></tr>'}
      </tbody></table></div><p class="muted" style="margin-top:10px">Costo total estimado del pedido: <b>${money(rows.reduce((a, r) => a + r.toOrder * r.cost, 0))}</b></p></div>`;
    csv = () => downloadCSV(`reposicion_${todayISO()}.csv`, rows, [{ label: 'Código', key: 'sku' }, { label: 'Producto', key: 'name' }, { label: 'Stock', key: 'stock' }, { label: 'Mínimo', key: 'minStock' }, { label: 'Sugerido', key: 'toOrder' }]);
  }
  $('#rcsv').onclick = () => csv();
}
