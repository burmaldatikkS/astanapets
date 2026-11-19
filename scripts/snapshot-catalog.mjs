/**
 * Снимок каталога при сборке: скачивает листы pets и shelters и кладёт их в public/data/catalog.json.
 * Сайт берёт этот файл, только если таблица недоступна совсем (ни opensheet, ни Google напрямую),
 * чтобы даже новый посетитель увидел каталог, а не ошибку.
 *
 * Скрипт никогда не ломает сборку: если таблица не ответила, снимок просто не обновится.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { loadSheet } from '../src/sheetSource.js';

const OUT_DIR = new URL('../public/data/', import.meta.url);

try {
  const [pets, shelters] = await Promise.all([loadSheet('pets'), loadSheet('shelters')]);
  if (!pets || pets.rows.length === 0) {
    console.warn('[snapshot] Лист pets не загрузился — снимок каталога не обновлён.');
  } else {
    await mkdir(OUT_DIR, { recursive: true });
    const snapshot = { savedAt: new Date().toISOString(), pets: pets.rows, shelters: shelters ? shelters.rows : null };
    await writeFile(new URL('catalog.json', OUT_DIR), JSON.stringify(snapshot));
    console.log(`[snapshot] Сохранено питомцев: ${pets.rows.length} (через ${pets.via}), приютов: ${shelters ? shelters.rows.length : 0}.`);
  }
} catch (error) {
  console.warn('[snapshot] Снимок каталога не сохранён:', error?.message || error);
}
