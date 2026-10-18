// Persistencia local del estado (localStorage) con respaldo/restauración en JSON.
import { buildDemoState } from './seed.js';

const KEY = 'sigi-retail-state-v1';

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 1 && Array.isArray(parsed.products)) return parsed;
    }
  } catch {
    /* almacenamiento bloqueado o dañado: se reinicia con datos de demostración */
  }
  const fresh = buildDemoState(new Date());
  saveState(fresh);
  return fresh;
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* sin almacenamiento disponible (modo privado): la sesión sigue en memoria */
  }
}

export function resetDemo() {
  const fresh = buildDemoState(new Date());
  saveState(fresh);
  return fresh;
}

export function exportBackup(state) {
  return new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
}

export function parseBackup(text) {
  const data = JSON.parse(text);
  if (!data || data.version !== 1 || !Array.isArray(data.products) || !Array.isArray(data.sales)) {
    throw new Error('El archivo no es un respaldo válido de SIGI Retail.');
  }
  return data;
}
