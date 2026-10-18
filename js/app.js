// Punto de entrada: registro de módulos, menú lateral y enrutador por hash.
import { $, $$, charts, closeModal, refreshChrome } from './ui.js';
import { renderDashboard } from './views/dashboard.js';
import { renderProducts } from './views/productos.js';
import { renderMovements } from './views/movimientos.js';
import { renderKardex } from './views/kardex.js';
import { renderPOS } from './views/ventas.js';
import { renderHistory } from './views/historial.js';
import { renderReports } from './views/reportes.js';

const routes = {
  dashboard: { group: '', icon: '▦', label: 'Panel principal', subtitle: 'Resumen del día y alertas de inventario', render: renderDashboard },
  productos: { group: 'Control de stock', icon: '◫', label: 'Productos', subtitle: 'Catálogo, precios y niveles de stock', render: renderProducts },
  movimientos: { group: 'Control de stock', icon: '⇅', label: 'Ingresos y ajustes', subtitle: 'Entrada de mercadería y ajustes por inventario físico', render: renderMovements },
  kardex: { group: 'Control de stock', icon: '≣', label: 'Kardex', subtitle: 'Historial de movimientos por producto', render: renderKardex },
  ventas: { group: 'Ventas', icon: '⊕', label: 'Punto de venta', subtitle: 'Registro de ventas con descuento automático de stock', render: renderPOS },
  historial: { group: 'Ventas', icon: '⎘', label: 'Historial de ventas', subtitle: 'Comprobantes emitidos y anulaciones', render: renderHistory },
  reportes: { group: 'Gestión', icon: '◔', label: 'Reportes', subtitle: 'Ventas, productos más vendidos e inventario valorizado', render: renderReports },
};
const HOME = 'dashboard';

function buildNav() {
  let group = null;
  $('#nav').innerHTML = Object.entries(routes).map(([key, r]) => {
    const header = r.group && r.group !== group ? `<p class="nav-group">${r.group}</p>` : '';
    group = r.group;
    return `${header}<a href="#/${key}" data-route="${key}"><span class="ico">${r.icon}</span> ${r.label}</a>`;
  }).join('');
}

function router() {
  const [path, query] = location.hash.replace(/^#\/?/, '').split('?');
  const key = routes[path] ? path : HOME;
  const params = new URLSearchParams(query || '');
  charts.splice(0).forEach((c) => c.destroy());
  $$('#nav a').forEach((a) => a.classList.toggle('active', a.dataset.route === key));
  $('#pageTitle').textContent = routes[key].label;
  $('#pageSubtitle').textContent = routes[key].subtitle;
  $('#sidebar').classList.remove('open');
  routes[key].render($('#view'), params);
  refreshChrome();
  window.scrollTo(0, 0);
}

$('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal' || e.target.closest('[data-close]')) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
$('#menuBtn').onclick = () => $('#sidebar').classList.toggle('open');
$('#lowStockChip').onclick = () => { location.hash = '#/productos?bajo=1'; };
window.addEventListener('hashchange', router);
buildNav();
router();
