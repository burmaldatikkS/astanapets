/**
 * Загрузка листов Google Таблицы с запасным путём.
 *
 * 1) opensheet.elk.sh — основной источник: отдаёт ячейки ровно так, как они видны в таблице.
 * 2) Google напрямую (gviz) — если opensheet не ответил. Особенность: в столбце, где почти везде
 *    TRUE/FALSE или числа, Google отбрасывает «чужие» значения (например, текст UNKNOWN) — для сайта
 *    это пустая ячейка, то есть «Неизвестно».
 *
 * Файл общий: им пользуется и сайт в браузере, и скрипт снимка каталога при сборке
 * (scripts/snapshot-catalog.mjs), поэтому здесь нет React и обращений к window.
 */

export const SHEET_ID = '10bRQ4TkJ1sY9PHzgxBgIYOFy15YNeabEziJC5kAynj4';

const TIMEOUT_MS = 6000;

const opensheetUrl = (sheet) => `https://opensheet.elk.sh/${SHEET_ID}/${encodeURIComponent(sheet)}`;
const googleUrl = (sheet) =>
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&headers=1&sheet=${encodeURIComponent(sheet)}`;

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

async function fromOpensheet(sheet) {
  const rows = JSON.parse(await fetchText(opensheetUrl(sheet)));
  if (!Array.isArray(rows)) throw new Error('opensheet вернул не список строк');
  return rows;
}

// Ответ Google обёрнут в google.visualization.Query.setResponse({...}); — достаём JSON и
// превращаем в такие же строки-объекты, как у opensheet: { id: 'pet-536', name: 'Мяу', ... }
export function parseGoogleResponse(text) {
  const json = JSON.parse(text.slice(text.indexOf('(') + 1, text.lastIndexOf(')')));
  if (json.status === 'error') throw new Error(json.errors?.[0]?.detailed_message || 'Google вернул ошибку');
  const labels = json.table.cols.map((col) => String(col.label || '').trim());
  return json.table.rows
    .map((row) => {
      const out = {};
      (row.c || []).forEach((cell, i) => {
        const key = labels[i];
        if (!key || !cell || cell.v === null || cell.v === undefined) return;
        if (typeof cell.v === 'boolean') out[key] = cell.v ? 'TRUE' : 'FALSE';
        else if (cell.f !== undefined && cell.f !== null) out[key] = String(cell.f); // так, как видно в таблице
        else out[key] = String(cell.v);
      });
      return out;
    })
    .filter((row) => Object.keys(row).length > 0);
}

async function fromGoogle(sheet) {
  return parseGoogleResponse(await fetchText(googleUrl(sheet)));
}

/** { rows, via: 'opensheet' | 'google' } или null, если не ответил ни один источник */
export async function loadSheet(sheet) {
  try {
    return { rows: await fromOpensheet(sheet), via: 'opensheet' };
  } catch (error) {
    console.warn(`opensheet не ответил для листа «${sheet}», пробуем Google напрямую:`, error?.message || error);
  }
  try {
    return { rows: await fromGoogle(sheet), via: 'google' };
  } catch (error) {
    console.error(`Не удалось загрузить лист «${sheet}» ни через opensheet, ни напрямую из Google:`, error?.message || error);
    return null;
  }
}
