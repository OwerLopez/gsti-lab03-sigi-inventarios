import * as inv from '../inventory.js';
import { ctx, $, money, esc, fmtDate, fmtDateTime, todayISO, daysAgo, stockBadge, chart, palette, kpi } from '../ui.js';

/* ---- Panel principal (HU-13) ---- */
export function renderDashboard(view) {
  const today = todayISO();
  const k = inv.dashboard(ctx.state, today);
  const daily = inv.salesByDay(ctx.state, { from: daysAgo(13), to: today });
  const methods = inv.salesByPaymentMethod(ctx.state, { from: today.slice(0, 8) + '01', to: today });
  const low = inv.lowStockProducts(ctx.state).slice(0, 7);
  const last = [...ctx.state.sales].reverse().slice(0, 6);

  view.innerHTML = `
    <div class="grid kpis">
      ${kpi('Ventas de hoy', money(k.salesToday), `${k.ticketsToday} comprobantes`)}
      ${kpi('Ventas del mes', money(k.salesMonth), 'solo comprobantes emitidos')}
      ${kpi('Ticket promedio', money(k.averageTicket), 'mes en curso')}
      ${kpi('Valor del inventario', money(k.inventoryValue), 'valorizado al costo')}
      ${kpi('Productos activos', k.activeProducts, 'en catálogo')}
      ${kpi('Stock bajo', k.lowStock, 'requieren reposición', k.lowStock > 0)}
    </div>
    <div class="grid cols-2" style="margin-top:16px">
      <div class="card"><h3>Ventas de los últimos 14 días</h3><div class="chart-box"><canvas id="cDaily"></canvas></div></div>
      <div class="card"><h3>Ventas del mes por método de pago</h3><div class="chart-box"><canvas id="cMethods"></canvas></div></div>
    </div>
    <div class="grid cols-2-eq" style="margin-top:16px">
      <div class="card"><h3>Alertas de stock mínimo <a href="#/productos?bajo=1" class="link">Ver todos</a></h3>
        <table><thead><tr><th>Producto</th><th class="num">Stock</th><th class="num">Mínimo</th><th class="num">Sugerido</th></tr></thead>
        <tbody>${low.map((p) => `<tr><td>${esc(p.name)}<br><small class="muted">${p.sku}</small></td><td class="num">${stockBadge(p)}</td><td class="num">${p.minStock}</td><td class="num">${p.toOrder}</td></tr>`).join('') || '<tr><td colspan="4" class="empty">Sin alertas</td></tr>'}</tbody></table>
      </div>
      <div class="card"><h3>Últimas ventas <a href="#/historial" class="link">Historial</a></h3>
        <table><thead><tr><th>Comprobante</th><th>Fecha</th><th>Pago</th><th class="num">Total</th></tr></thead>
        <tbody>${last.map((s) => `<tr><td>${s.id} ${s.status === 'ANULADA' ? '<span class="badge bad">Anulada</span>' : ''}</td><td>${fmtDateTime(s.at)}</td><td>${inv.PAYMENT_METHODS[s.paymentMethod]}</td><td class="num">${money(s.total)}</td></tr>`).join('')}</tbody></table>
      </div>
    </div>`;

  chart($('#cDaily'), {
    type: 'bar',
    data: { labels: daily.map((d) => fmtDate(d.day).slice(0, 5)), datasets: [{ label: 'Ventas (S/)', data: daily.map((d) => d.total), backgroundColor: '#2563b0', borderRadius: 6 }] },
    options: { maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } },
  });
  chart($('#cMethods'), {
    type: 'doughnut',
    data: { labels: methods.map((m) => m.label), datasets: [{ data: methods.map((m) => m.total), backgroundColor: palette }] },
    options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } },
  });
}
