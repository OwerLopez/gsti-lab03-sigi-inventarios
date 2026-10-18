import { ctx, $, esc, todayISO, commit, toast, download, rerender } from '../ui.js';
import { saveState, resetDemo, exportBackup, parseBackup } from '../store.js';

/* ---- Configuración y respaldo (HU-18) ---- */
export function renderConfig(view) {
  const st = ctx.state.settings;
  view.innerHTML = `
    <div class="grid cols-2-eq">
      <div class="card"><h3>Datos de la tienda</h3>
        <form id="sf" class="form-grid">
          <label class="full">Nombre comercial<input name="storeName" value="${esc(st.storeName)}" required></label>
          <label>RUC<input name="ruc" value="${esc(st.ruc)}" pattern="\\d{11}" required></label>
          <label>IGV<input value="18 %" disabled></label>
          <label class="full">Dirección<input name="address" value="${esc(st.address)}"></label>
          <div class="full"><button class="btn">Guardar</button></div>
        </form></div>
      <div class="card"><h3>Respaldo de la información</h3>
        <p class="muted">Los datos se guardan en el navegador. Descarga un respaldo en JSON con frecuencia o restaura uno anterior.</p>
        <div class="toolbar" style="margin-top:12px"><button class="btn" id="bk">Descargar respaldo</button>
          <label class="btn secondary" style="display:inline-block">Restaurar respaldo<input type="file" id="rs" accept="application/json" hidden></label></div>
        <hr style="border:0;border-top:1px solid var(--line);margin:16px 0">
        <p class="muted">Restablecer los datos de demostración (catálogo de 26 productos y 30 días de ventas).</p>
        <button class="btn danger" id="reset" style="margin-top:8px">Restablecer datos de demostración</button>
        <p class="muted" style="margin-top:16px">Registros actuales: ${ctx.state.products.length} productos · ${ctx.state.sales.length} ventas · ${ctx.state.movements.length} movimientos.</p>
      </div>
    </div>`;
  $('#sf').onsubmit = (e) => {
    e.preventDefault();
    commit(() => Object.assign(ctx.state.settings, Object.fromEntries(new FormData(e.target))), 'Datos de la tienda guardados');
  };
  $('#bk').onclick = () => download(`sigi-respaldo-${todayISO()}.json`, exportBackup(ctx.state));
  $('#rs').onchange = async (e) => {
    try {
      ctx.state = parseBackup(await e.target.files[0].text());
      saveState(ctx.state);
      toast('Respaldo restaurado', 'ok');
      rerender();
    } catch (err) { toast(err.message, 'error'); }
  };
  $('#reset').onclick = () => {
    if (confirm('¿Restablecer los datos de demostración? Se perderán los cambios no respaldados.')) { ctx.state = resetDemo(); toast('Datos de demostración restablecidos', 'ok'); rerender(); }
  };
}
