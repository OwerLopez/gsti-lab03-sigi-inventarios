// Punto de entrada: registro de módulos, menú lateral y enrutador por hash.
import { $, $$, charts, closeModal, refreshChrome } from './ui.js';
import { renderProducts } from './views/productos.js';

const routes = {
  productos: { group: 'Control de stock', icon: '◫', label: 'Productos', subtitle: 'Catálogo, precios y niveles de stock', render: renderProducts },
};
const HOME = 'productos';

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
