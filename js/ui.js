// Utilidades compartidas de la interfaz: estado de la sesión, formato, avisos, modales y gráficos.
import * as inv from './inventory.js';
import { loadState, saveState } from './store.js';

export const ctx = { state: loadState() };
export const charts = [];

/** Vuelve a dibujar la vista actual (lo atiende el enrutador de app.js). */
export const rerender = () => window.dispatchEvent(new HashChangeEvent('hashchange'));

/* ------------------------------ utilidades ------------------------------ */
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const money = (n) => `S/ ${Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const fmtDate = (iso) => iso.slice(0, 10).split('-').reverse().join('/');
export const fmtDateTime = (iso) => `${fmtDate(iso)} ${iso.slice(11, 16)}`;
export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
export const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
export const localStamp = () => {
  const d = new Date();
  return `${todayISO()}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
};

export function commit(fn, okMsg) {
  try {
    const result = fn();
    saveState(ctx.state);
    if (okMsg) toast(typeof okMsg === 'function' ? okMsg(result) : okMsg, 'ok');
    refreshChrome();
    return result;
  } catch (err) {
    toast(err.message, 'error');
    return null;
  }
}

export function toast(msg, kind = '') {
  const el = document.createElement('div');
  el.className = `toast ${kind}`;
  el.textContent = msg;
  $('#toasts').append(el);
  setTimeout(() => el.remove(), 3800);
}

export function openModal(title, html, onMount) {
  $('#modalTitle').textContent = title;
  $('#modalBody').innerHTML = html;
  $('#modal').hidden = false;
  onMount?.($('#modalBody'));
}
export function closeModal() { $('#modal').hidden = true; $('#modalBody').innerHTML = ''; }

export function stockBadge(p) {
  if (!p.active) return '<span class="badge grey">Inactivo</span>';
  if (p.stock === 0) return `<span class="badge bad">Agotado</span>`;
  if (p.stock <= p.minStock) return `<span class="badge warn">${p.stock} · bajo</span>`;
  return `<span class="badge ok">${p.stock}</span>`;
}

export function download(name, blob) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
export function downloadCSV(name, rows, columns) {
  download(name, new Blob(['﻿' + inv.toCSV(rows, columns)], { type: 'text/csv;charset=utf-8' }));
}

export function chart(canvas, config) {
  if (!window.Chart) return;
  charts.push(new window.Chart(canvas, config));
}
export const palette = ['#2563b0', '#15803d', '#b45309', '#7c3aed', '#c0262d', '#0e7490', '#64748b'];

export function refreshChrome() {
  const low = inv.lowStockProducts(ctx.state).length;
  const chip = $('#lowStockChip');
  chip.textContent = low ? `⚠ ${low} con stock bajo` : '✓ Stock en orden';
  chip.className = low ? 'chip' : 'chip ok';
  $('#storeName').textContent = ctx.state.settings.storeName;
}

export const kpi = (label, value, hint, alert = false) => `<div class="card kpi ${alert ? 'alert' : ''}"><div class="label">${label}</div><div class="value">${value}</div><div class="hint">${hint}</div></div>`;

export const typeBadge = { INGRESO: 'ok', SALIDA: 'info', AJUSTE: 'warn', DEVOLUCION: 'grey' };
export function movRow(m, withProduct) {
  const p = ctx.state.products.find((x) => x.id === m.productId);
  return `<tr><td>${m.id}</td><td>${fmtDateTime(m.at)}</td><td><span class="badge ${typeBadge[m.type]}">${m.type}</span></td>
    ${withProduct ? `<td>${esc(p?.name)}</td>` : ''}<td class="num">${m.qty > 0 ? '+' : ''}${m.qty}</td><td class="num">${money(m.unitCost)}</td>
    <td class="num"><b>${m.balance}</b></td><td>${esc([m.reference, m.note].filter(Boolean).join(' · '))}</td><td>${m.user}</td></tr>`;
}
