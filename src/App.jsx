import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  PawPrint,
  ShieldCheck,
  Search,
  Heart,
  X,
  Cpu,
  Check,
  Minus,
  Phone,
  Copy,
  MessageCircle,
  Instagram,
  ExternalLink,
  RotateCcw,
  Dog,
  Cat,
  Baby,
  Scissors,
  Wallet,
  ChevronRight,
  Info,
  MapPin,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Quote,
  Syringe,
  Home,
  Smile,
  HeartHandshake,
} from 'lucide-react';

/* =====================================================================
 * 1. АНАЛИТИКА
 * ===================================================================== */

// Укажите номер счётчика Яндекс.Метрики, когда подключите его в index.html
const YM_COUNTER_ID = null; // например: 98765432

/**
 * Единый трекер событий.
 * 1) Пишет структурированный лог в консоль.
 * 2) Если подключены Яндекс.Метрика (window.ym) и/или GA4 (window.gtag) — отправляет туда.
 */
export function trackEvent(eventName, payload = {}) {
  const data = { ...payload, ts: new Date().toISOString(), path: typeof window !== 'undefined' ? window.location.pathname : '' };

  try {
    console.groupCollapsed(
      `%c📊 AstanaPets %c${eventName}`,
      'background:#FF6B4A;color:#fff;padding:2px 6px;border-radius:4px 0 0 4px;font-weight:600',
      'background:#0F172A;color:#fff;padding:2px 6px;border-radius:0 4px 4px 0'
    );
    console.table(data);
    console.groupEnd();
  } catch (_) {
    /* консоль недоступна — игнорируем */
  }

  if (typeof window === 'undefined') return;

  try {
    if (typeof window.ym === 'function' && YM_COUNTER_ID) {
      window.ym(YM_COUNTER_ID, 'reachGoal', eventName, data);
    }
  } catch (e) {
    console.warn('[trackEvent] Ошибка отправки в Яндекс.Метрику', e);
  }

  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, data);
    }
  } catch (e) {
    console.warn('[trackEvent] Ошибка отправки в Google Analytics', e);
  }
}

/* =====================================================================
 * 2. ДАННЫЕ
 * ---------------------------------------------------------------------
 * Структура объекта = одна строка Google Таблицы / таблицы Supabase `pets`.
 * Все поля «плоские»: строки, числа, булевы. Списки (теги) — строка через «|»,
 * как удобно хранить в ячейке таблицы.
 *
 * Столбцы таблицы:
 * id | status | name | species | sex | age_months | size | photo_url | description |
 * character_tags | shelter_name | shelter_verified | shelter_instagram | reports_url |
 * curator_name | curator_phone | curator_whatsapp | kaspi_phone | kaspi_link |
 * chip_number | is_registered | is_vaccinated | is_sterilized | is_parasite_treated |
 * good_with_kids | good_with_animals | apartment_friendly | beginner_friendly | fundraising_goal_kzt | fundraising_collected_kzt |
 * fundraising_purpose | donation_usage | created_at
 *
 * ⚠️ ВСЕ ДАННЫЕ НИЖЕ ТЕСТОВЫЕ: телефоны, номера чипов, реквизиты и ссылки вымышлены.
 * Перед запуском замените их на реальные данные, согласованные с приютами.
 * ===================================================================== */

const MOCK_PETS = [
  {
    id: 'pet-001',
    status: 'available',
    name: 'Барон',
    species: 'dog',
    sex: 'male',
    age_months: 36,
    size: 'large',
    photo_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
    description:
      'Барона нашли зимой у трассы на Караганду — он сидел у остановки и ждал, что за ним вернутся. Оказался очень воспитанным: знает команды «сидеть», «рядом», спокойно ходит на поводке. Обожает долгие прогулки по набережной Есиля и не тянет. Подойдёт активной семье с частным домом или просторной квартирой.',
    character_tags: 'Спокойный|Знает поводок|Привит|Любит гулять',
    shelter_name: 'Ковчег Астана',
    shelter_verified: true,
    shelter_instagram: 'https://instagram.com/',
    reports_url: 'https://instagram.com/',
    curator_name: 'Айгерим',
    curator_phone: '+7 700 000 00 01',
    curator_whatsapp: '77000000001',
    kaspi_phone: '+7 700 000 00 01',
    kaspi_link: 'https://kaspi.kz/',
    chip_number: '398000000000101',
    is_registered: true,
    is_vaccinated: true,
    is_sterilized: true,
    is_parasite_treated: true,
    good_with_kids: true,
    good_with_animals: false,
    apartment_friendly: false,
    beginner_friendly: true,
    fundraising_goal_kzt: 60000,
    fundraising_collected_kzt: 41500,
    fundraising_purpose: 'корм на зиму и ревакцинацию',
    donation_usage: 'Корм, обработка от паразитов и оплата ветклиники',
    created_at: '2026-10-02',
  },
  {
    id: 'pet-002',
    status: 'available',
    name: 'Муся',
    species: 'cat',
    sex: 'female',
    age_months: 8,
    size: 'small',
    photo_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
    description:
      'Мусю принесли волонтёры из подвала на Левом берегу вместе с братьями — их уже разобрали, а она всё ждёт. Ласковая, мурчит при первом прикосновении, приучена к лотку и когтеточке. Немного стесняется в первые дни, но быстро становится «хвостиком» хозяина.',
    character_tags: 'Ласковая|Приучена к лотку|Игривая',
    shelter_name: 'Я живой',
    shelter_verified: true,
    shelter_instagram: 'https://instagram.com/',
    reports_url: 'https://instagram.com/',
    curator_name: 'Дана',
    curator_phone: '+7 701 000 00 02',
    curator_whatsapp: '77010000002',
    kaspi_phone: '+7 701 000 00 02',
    kaspi_link: 'https://kaspi.kz/',
    chip_number: '',
    is_registered: false,
    is_vaccinated: true,
    is_sterilized: false,
    is_parasite_treated: true,
    good_with_kids: true,
    good_with_animals: true,
    apartment_friendly: true,
    beginner_friendly: true,
    fundraising_goal_kzt: 35000,
    fundraising_collected_kzt: 12000,
    fundraising_purpose: 'стерилизацию и чипирование',
    donation_usage: 'Стерилизация, чипирование и корм для котят',
    created_at: '2026-10-28',
  },
  {
    id: 'pet-003',
    status: 'available',
    name: 'Шарик',
    species: 'dog',
    sex: 'male',
    age_months: 5,
    size: 'medium',
    photo_url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80',
    description:
      'Весёлый щенок-метис, вырастет до среднего размера (примерно 15–18 кг). Любит людей, детей и других собак, быстро учится. Сейчас осваивает пелёнку и поводок. Ищем семью, которая готова заниматься с ним и не оставлять надолго одного.',
    character_tags: 'Энергичный|Дружелюбный|Учится командам',
    shelter_name: 'Zverohelp',
    shelter_verified: true,
    shelter_instagram: 'https://instagram.com/',
    reports_url: 'https://instagram.com/',
    curator_name: 'Ерлан',
    curator_phone: '+7 702 000 00 03',
    curator_whatsapp: '77020000003',
    kaspi_phone: '+7 702 000 00 03',
    kaspi_link: 'https://kaspi.kz/',
    chip_number: '398000000000303',
    is_registered: true,
    is_vaccinated: true,
    is_sterilized: false,
    is_parasite_treated: true,
    good_with_kids: true,
    good_with_animals: true,
    apartment_friendly: true,
    beginner_friendly: false,
    fundraising_goal_kzt: 0,
    fundraising_collected_kzt: 0,
    fundraising_purpose: '',
    donation_usage: 'Корм, вакцинация щенков и аренда вольеров',
    created_at: '2026-11-05',
  },
  {
    id: 'pet-004',
    status: 'available',
    name: 'Граф',
    species: 'cat',
    sex: 'male',
    age_months: 60,
    size: 'large',
    photo_url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80',
    description:
      'Крупный, статный кот с характером настоящего аристократа. Жил в квартире, но хозяйка уехала и оставила его в подъезде. Спокойный, не дерёт мебель, любит сидеть на подоконнике и наблюдать за городом. Лучше всего подойдёт взрослым людям или семье без маленьких детей.',
    character_tags: 'Спокойный|Домашний|Самостоятельный|Привит',
    shelter_name: 'Ковчег Астана',
    shelter_verified: true,
    shelter_instagram: 'https://instagram.com/',
    reports_url: 'https://instagram.com/',
    curator_name: 'Айгерим',
    curator_phone: '+7 700 000 00 01',
    curator_whatsapp: '77000000001',
    kaspi_phone: '+7 700 000 00 01',
    kaspi_link: 'https://kaspi.kz/',
    chip_number: '398000000000404',
    is_registered: true,
    is_vaccinated: true,
    is_sterilized: true,
    is_parasite_treated: true,
    good_with_kids: false,
    good_with_animals: true,
    apartment_friendly: true,
    beginner_friendly: true,
    fundraising_goal_kzt: 25000,
    fundraising_collected_kzt: 25000,
    fundraising_purpose: 'лечение зубов',
    donation_usage: 'Корм, обработка от паразитов и оплата ветклиники',
    created_at: '2026-09-14',
  },
  {
    id: 'pet-005',
    status: 'available',
    name: 'Белка',
    species: 'dog',
    sex: 'female',
    age_months: 24,
    size: 'small',
    photo_url: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=800&q=80',
    description:
      'Маленькая (около 7 кг) и очень преданная собачка. Живёт на передержке в квартире, поэтому привыкла к домашней жизни: не шумит, терпит до прогулки, спит на своей лежанке. Отлично ладит с кошками и детьми. Идеальна для квартиры в городе.',
    character_tags: 'Компактная|Тихая|Ладит с кошками|Знает поводок',
    shelter_name: 'Я живой',
    shelter_verified: true,
    shelter_instagram: 'https://instagram.com/',
    reports_url: 'https://instagram.com/',
    curator_name: 'Дана',
    curator_phone: '+7 701 000 00 02',
    curator_whatsapp: '77010000002',
    kaspi_phone: '+7 701 000 00 02',
    kaspi_link: 'https://kaspi.kz/',
    chip_number: '398000000000505',
    is_registered: true,
    is_vaccinated: true,
    is_sterilized: true,
    is_parasite_treated: true,
    good_with_kids: true,
    good_with_animals: true,
    apartment_friendly: true,
    beginner_friendly: true,
    fundraising_goal_kzt: 0,
    fundraising_collected_kzt: 0,
    fundraising_purpose: '',
    donation_usage: 'Стерилизация, чипирование и корм для котят',
    created_at: '2026-10-19',
  },
  {
    id: 'pet-006',
    status: 'available',
    name: 'Луна',
    species: 'cat',
    sex: 'female',
    age_months: 18,
    size: 'medium',
    photo_url: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=800&q=80',
    description:
      'Луну подобрали после того, как она повредила лапу во дворе на Сарыарке. Лапу вылечили, хромоты почти не осталось. Нежная, разговорчивая кошка, любит спать рядом с человеком. С другими кошками держит дистанцию, поэтому лучше будет единственным питомцем.',
    character_tags: 'Нежная|Разговорчивая|Приучена к лотку',
    shelter_name: 'Zverohelp',
    shelter_verified: true,
    shelter_instagram: 'https://instagram.com/',
    reports_url: 'https://instagram.com/',
    curator_name: 'Ерлан',
    curator_phone: '+7 702 000 00 03',
    curator_whatsapp: '77020000003',
    kaspi_phone: '+7 702 000 00 03',
    kaspi_link: 'https://kaspi.kz/',
    chip_number: '',
    is_registered: false,
    is_vaccinated: true,
    is_sterilized: true,
    is_parasite_treated: false,
    good_with_kids: true,
    good_with_animals: false,
    apartment_friendly: true,
    beginner_friendly: false,
    fundraising_goal_kzt: 40000,
    fundraising_collected_kzt: 27800,
    fundraising_purpose: 'реабилитацию лапы и корм',
    donation_usage: 'Корм, вакцинация щенков и аренда вольеров',
    created_at: '2026-11-11',
  },
];

/* =====================================================================
 * ЗАГРУЗКА ДАННЫХ ИЗ GOOGLE ТАБЛИЦЫ (2 листа через OpenSheet)
 * ---------------------------------------------------------------------
 * Лист `pets`     — питомцы (столбцы как в MOCK_PETS).
 * Лист `shelters` — приюты. Столбцы:
 *   shelter_name | shelter_verified | shelter_instagram | reports_url |
 *   curator_name | curator_phone | curator_whatsapp | kaspi_phone | kaspi_link | donation_usage
 *
 * Питомец связывается с приютом по совпадению shelter_name (пробелы по краям не учитываются).
 * Реквизиты и отчёты берутся из листа приютов; контакты куратора — из строки питомца,
 * а если там пусто — из строки приюта.
 * Если оба запроса упали или таблицы пустые — показываем резервные MOCK_PETS.
 * ===================================================================== */

const SHEET_ID = '10bRQ4TkJ1sY9PHzgxBgIYOFy15YNeabEziJC5kAynj4';
const PETS_API_URL = `https://opensheet.elk.sh/${SHEET_ID}/pets`;
const SHELTERS_API_URL = `https://opensheet.elk.sh/${SHEET_ID}/shelters`;

// Поля, которые всегда берутся из листа приютов (если там заполнены)
const SHELTER_OWNED_FIELDS = ['shelter_verified', 'shelter_instagram', 'reports_url', 'kaspi_phone', 'kaspi_link', 'donation_usage'];
// Поля куратора: сначала из строки питомца, при пустом значении — из приюта
const CURATOR_FIELDS = ['curator_name', 'curator_phone', 'curator_whatsapp'];

const cleanText = (v) => (v === undefined || v === null ? '' : String(v).trim());
const isFilled = (v) => cleanText(v) !== '';
const shelterKey = (name) => cleanText(name);

// Загружает один лист; при ошибке возвращает null, чтобы не ронять второй запрос
async function fetchSheet(url, label) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Ошибка загрузки листа «${label}»: ${response.status}`);
    }
    const rows = await response.json();
    return Array.isArray(rows) ? rows : [];
  } catch (error) {
    console.error(`Не удалось загрузить лист «${label}» из Google Таблицы:`, error);
    return null;
  }
}

// Подтягивает в строку питомца данные его приюта
function mergePetWithShelter(pet, sheltersByName) {
  const shelter = sheltersByName.get(shelterKey(pet.shelter_name));
  const merged = { ...pet, shelter_name: cleanText(pet.shelter_name) };
  if (!shelter) return merged;

  SHELTER_OWNED_FIELDS.forEach((field) => {
    if (isFilled(shelter[field])) merged[field] = shelter[field];
  });
  CURATOR_FIELDS.forEach((field) => {
    if (!isFilled(merged[field]) && isFilled(shelter[field])) merged[field] = shelter[field];
  });
  return merged;
}

/**
 * Загружает оба листа параллельно и склеивает их.
 * Возвращает { pets, shelters, source }:
 *   pets     — строки питомцев (ещё без normalizePet)
 *   shelters — строки приютов из листа `shelters` или null, если лист недоступен/пуст
 *   source   — 'sheet' | 'mock'
 * Пример для Supabase: два запроса .from('pets') и .from('shelters') вместо fetchSheet.
 */
async function fetchData() {
  const [petRows, shelterRows] = await Promise.all([
    fetchSheet(PETS_API_URL, 'pets'),
    fetchSheet(SHELTERS_API_URL, 'shelters'),
  ]);

  // Пустые строки таблицы не превращаются в пустые карточки
  const pets = (petRows || []).filter((row) => isFilled(row.name));
  const shelters = (shelterRows || [])
    .filter((row) => isFilled(row.shelter_name))
    .map((row) => ({ ...row, shelter_name: cleanText(row.shelter_name) }));

  if (pets.length === 0) {
    console.warn('Лист pets недоступен или пуст — показываем резервные данные MOCK_PETS.');
    return { pets: MOCK_PETS, shelters: null, source: 'mock' };
  }

  const sheltersByName = new Map(shelters.map((sh) => [shelterKey(sh.shelter_name), sh]));
  return {
    pets: pets.map((pet) => mergePetWithShelter(pet, sheltersByName)),
    shelters: shelters.length > 0 ? shelters : null,
    source: 'sheet',
  };
}

// Строка приюта из таблицы → нужные типы
function normalizeShelter(row) {
  const bool = (v) => v === true || v === 'TRUE' || v === 'true' || v === '1' || v === 1;
  return {
    shelter_name: cleanText(row.shelter_name),
    shelter_verified: bool(row.shelter_verified),
    shelter_instagram: cleanText(row.shelter_instagram),
    reports_url: cleanText(row.reports_url),
    curator_name: cleanText(row.curator_name),
    curator_phone: cleanText(row.curator_phone),
    curator_whatsapp: cleanText(row.curator_whatsapp),
    kaspi_phone: cleanText(row.kaspi_phone),
    kaspi_link: cleanText(row.kaspi_link),
    donation_usage: cleanText(row.donation_usage),
  };
}

// Карточка приюта, собранная из строки питомца (если приюта нет в листе `shelters`)
function shelterFromPet(p) {
  return {
    shelter_name: p.shelter_name,
    shelter_verified: p.shelter_verified,
    shelter_instagram: p.shelter_instagram,
    reports_url: p.reports_url,
    curator_name: p.curator_name,
    curator_phone: p.curator_phone,
    curator_whatsapp: p.curator_whatsapp,
    kaspi_phone: p.kaspi_phone,
    kaspi_link: p.kaspi_link,
    donation_usage: p.donation_usage,
  };
}

// Приводит строку из таблицы к нужным типам (в Google Таблице всё приходит строками)
function normalizePet(row) {
  const bool = (v) => v === true || v === 'TRUE' || v === 'true' || v === '1' || v === 1;
  const num = (v) => Number(String(v ?? '0').replace(/\s/g, '')) || 0;
  return {
    ...row,
    age_months: num(row.age_months),
    shelter_verified: bool(row.shelter_verified),
    is_registered: bool(row.is_registered),
    is_vaccinated: bool(row.is_vaccinated),
    is_sterilized: bool(row.is_sterilized),
    is_parasite_treated: bool(row.is_parasite_treated),
    good_with_kids: bool(row.good_with_kids),
    good_with_animals: bool(row.good_with_animals),
    apartment_friendly: bool(row.apartment_friendly),
    beginner_friendly: bool(row.beginner_friendly),
    fundraising_goal_kzt: num(row.fundraising_goal_kzt),
    fundraising_collected_kzt: num(row.fundraising_collected_kzt),
    chip_number: row.chip_number ? String(row.chip_number) : '',
  };
}

/* =====================================================================
 * 3. УТИЛИТЫ
 * ===================================================================== */

const formatKZT = (n) => `${new Intl.NumberFormat('ru-RU').format(n)} ₸`;

function pluralRu(n, forms) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}

function formatAge(months) {
  if (months < 12) return `${months} ${pluralRu(months, ['месяц', 'месяца', 'месяцев'])}`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const y = `${years} ${pluralRu(years, ['год', 'года', 'лет'])}`;
  return rest ? `${y} ${rest} мес.` : y;
}

const SEX_LABEL = { male: 'Мальчик', female: 'Девочка' };
const SIZE_LABEL = { small: 'Маленький', medium: 'Средний', large: 'Крупный' };
const splitTags = (s) => (s ? String(s).split('|').map((t) => t.trim()).filter(Boolean) : []);

async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (_) {
    /* перейдём к запасному способу */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (_) {
    return false;
  }
}

const FALLBACK_PHOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#F1F5F9"/><text x="200" y="160" font-size="64" text-anchor="middle">🐾</text></svg>'
  );

/* =====================================================================
 * 4. ФИЛЬТРЫ
 * ===================================================================== */

const DEFAULT_FILTERS = {
  query: '',
  species: 'all',
  sex: 'all',
  age: 'all',
  size: 'all',
  chippedOnly: false,
  sterilized: false,
  goodWithKids: false,
  goodWithAnimals: false,
  vaccinated: false,
  apartmentFriendly: false,
  beginnerFriendly: false,
  openFundraising: false,
};

const FILTER_GROUPS = [
  {
    key: 'species',
    label: 'Вид',
    options: [
      { value: 'all', label: 'Все' },
      { value: 'dog', label: 'Собаки', icon: Dog },
      { value: 'cat', label: 'Кошки', icon: Cat },
    ],
  },
  {
    key: 'sex',
    label: 'Пол',
    options: [
      { value: 'all', label: 'Любой' },
      { value: 'male', label: 'Мальчик' },
      { value: 'female', label: 'Девочка' },
    ],
  },
  {
    key: 'age',
    label: 'Возраст',
    options: [
      { value: 'all', label: 'Любой' },
      { value: 'baby', label: 'До 1 года' },
      { value: 'young', label: '1–3 года' },
      { value: 'adult', label: 'Старше 3 лет' },
    ],
  },
  {
    key: 'size',
    label: 'Размер',
    options: [
      { value: 'all', label: 'Любой' },
      { value: 'small', label: 'Маленький' },
      { value: 'medium', label: 'Средний' },
      { value: 'large', label: 'Крупный' },
    ],
  },
];

const TOGGLES = [
  { key: 'chippedOnly', label: 'Только чипированные (по стандарту РК)', icon: Cpu },
  { key: 'sterilized', label: 'Стерилизация / кастрация', icon: Scissors },
  { key: 'vaccinated', label: 'Привит по возрасту', icon: Syringe },
  { key: 'goodWithKids', label: 'Ладит с детьми', icon: Baby },
  { key: 'goodWithAnimals', label: 'Ладит с другими животными', icon: PawPrint },
  { key: 'apartmentFriendly', label: 'Подходит для квартиры', icon: Home },
  { key: 'beginnerFriendly', label: 'Подойдёт новичку', icon: Smile },
  { key: 'openFundraising', label: 'Открыт сбор на помощь', icon: HeartHandshake },
];

// Сбор считается открытым, если цель задана и ещё не достигнута
const hasOpenFundraising = (p) => p.fundraising_goal_kzt > 0 && p.fundraising_collected_kzt < p.fundraising_goal_kzt;

function applyFilters(pets, f) {
  const q = f.query.trim().toLowerCase();
  return pets.filter((p) => {
    if (p.status && p.status !== 'available') return false;
    if (q && !`${p.name} ${p.description} ${p.character_tags}`.toLowerCase().includes(q)) return false;
    if (f.species !== 'all' && p.species !== f.species) return false;
    if (f.sex !== 'all' && p.sex !== f.sex) return false;
    if (f.age === 'baby' && !(p.age_months < 12)) return false;
    if (f.age === 'young' && !(p.age_months >= 12 && p.age_months <= 36)) return false;
    if (f.age === 'adult' && !(p.age_months > 36)) return false;
    if (f.size !== 'all' && p.size !== f.size) return false;
    if (f.chippedOnly && !p.chip_number) return false;
    if (f.sterilized && !p.is_sterilized) return false;
    if (f.goodWithKids && !p.good_with_kids) return false;
    if (f.goodWithAnimals && !p.good_with_animals) return false;
    if (f.vaccinated && !p.is_vaccinated) return false;
    if (f.apartmentFriendly && !p.apartment_friendly) return false;
    if (f.beginnerFriendly && !p.beginner_friendly) return false;
    if (f.openFundraising && !hasOpenFundraising(p)) return false;
    return true;
  });
}

const isFiltersDirty = (f) => Object.keys(DEFAULT_FILTERS).some((k) => f[k] !== DEFAULT_FILTERS[k]);

/* =====================================================================
 * 5. СТИЛИ, ШРИФТ И АНИМАЦИИ
 * ---------------------------------------------------------------------
 * Концепция «Тёплый дом и солнечный свет».
 * Все фирменные цвета заданы семантическими CSS-классами с префиксом .ap-
 * (см. GLOBAL_CSS), без произвольных классов Tailwind в квадратных скобках.
 *   #FAF7F2 — кремовый фон страницы   #FFFFFF — молочно-белые карточки
 *   #2C2A29 — графитовый текст        #F26A4B — кораллово-оранжевый акцент
 *   #4CAF7D — яблочно-зелёный акцент (проверка, здоровье, сборы)
 * ===================================================================== */

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@500;600;700;800&display=swap&subset=cyrillic');

/* ---------- Каркас и шрифт ---------- */
.ap-root, .ap-root button, .ap-root input, .ap-root a, .ap-root label {
  font-family: 'Nunito', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
}
.ap-root { background-color: #FAF7F2; color: #2C2A29; }

/* ---------- Текст ---------- */
.ap-text-main { color: #2C2A29; }
.ap-text-accent { color: #D9502F; }          /* коралловый, чуть темнее для читаемости текста */
.ap-text-sage-deep { color: #2E8A5A; }       /* зелёный для иконок и мелкого текста */
.ap-text-sage { color: #7DDBA8; }
.ap-link:hover { color: #2C2A29; }
.ap-prose { line-height: 1.8; }

/* ---------- Поверхности ---------- */
.ap-surface { background-color: #FAF7F2; }
.ap-sand { background-color: #F0EAE1; }
.ap-sand-deep { background-color: #E7DFD3; }
.ap-modal-bg { background-color: #FAF7F2; }
.ap-header-glass { background-color: rgba(250, 247, 242, 0.85); }
.ap-glass { background-color: rgba(250, 247, 242, 0.92); }
.ap-overlay { background-color: rgba(44, 42, 41, 0.45); }

/* Порядок важен: мягкая тень объявлена раньше цветных, чтобы кнопки сохраняли своё свечение */
.ap-shadow-soft { box-shadow: 0 6px 20px rgba(44, 42, 41, 0.10); }
.ap-card { background-color: #FFFFFF; box-shadow: 0 10px 30px rgba(242, 106, 75, 0.08); }
.ap-card-hover:hover { box-shadow: 0 16px 40px rgba(242, 106, 75, 0.14); }

/* ---------- Главный акцент: кораллово-оранжевый #F26A4B ---------- */
.ap-btn-accent { background-color: #F26A4B; color: #FFFFFF; box-shadow: 0 6px 18px rgba(242, 106, 75, 0.28); }
.ap-btn-accent:hover { background-color: #E05636; }
.ap-btn-accent-soft { background-color: #FFE5DD; color: #C9431F; border-color: #FFC2B0; }
.ap-btn-accent-soft:hover { background-color: #FFD6C9; border-color: #FFAD96; }
.ap-btn-outline-accent { background-color: #FFE5DD; color: #C9431F; border-color: #F26A4B; }
.ap-accent-soft { background-color: #FFE5DD; }
.ap-hover-accent-soft:hover { background-color: #FFE5DD; }
.ap-heart-on { color: #F26A4B; fill: #F26A4B; }

/* Чипсы, вкладки, вторичные кнопки */
.ap-chip-idle { background-color: #FAF7F2; color: #57534E; border-color: #E3D9CB; }
.ap-chip-idle:hover { background-color: #FFE5DD; border-color: #FFC2B0; color: #2C2A29; }
.ap-chip-active { background-color: #F26A4B; border-color: #F26A4B; color: #FFFFFF; box-shadow: 0 6px 16px rgba(242, 106, 75, 0.25); }
.ap-tab-idle { color: #57534E; }
.ap-tab-idle:hover { background-color: #FAF7F2; color: #2C2A29; }

/* ---------- Второй акцент: яблочно-зелёный #4CAF7D ---------- */
/* Текст на зелёном — графитовый: белый на #4CAF7D читается хуже */
.ap-sage { background-color: #4CAF7D; color: #2C2A29; }
.ap-sage-fill { background-color: #4CAF7D; }
.ap-sage-soft { background-color: #E2F6EA; }
.ap-sage-panel { background-color: #E2F6EA; border-color: #B3E3C7; }
.ap-toggle-idle { background-color: #FAF7F2; color: #57534E; border-color: #E3D9CB; }
.ap-toggle-idle:hover { background-color: #E2F6EA; border-color: #B3E3C7; }
.ap-toggle-active { background-color: #4CAF7D; border-color: #4CAF7D; color: #2C2A29; box-shadow: 0 6px 16px rgba(76, 175, 125, 0.30); }
.ap-track-off { background-color: #E3D9CB; }
.ap-track-on { background-color: #2F9C64; }
.ap-knob { background-color: #FFFDF9; box-shadow: 0 1px 3px rgba(44, 42, 41, 0.25); }
.ap-progress-fill { background-image: linear-gradient(to right, #FFB547, #F26A4B); }

/* ---------- Графит, поля ввода, внешние сервисы ---------- */
.ap-bg-graphite { background-color: #2C2A29; color: #FAF7F2; }
.ap-bg-graphite:hover { background-color: #403C3A; }
.ap-input { background-color: #FAF7F2; border-color: #E3D9CB; color: #2C2A29; }
.ap-input:focus { border-color: #F26A4B; box-shadow: 0 0 0 4px rgba(242, 106, 75, 0.15); }
.ap-field { background-color: #FAF7F2; border-color: #E3D9CB; color: #2C2A29; }
.ap-btn-whatsapp { background-color: #3FB871; color: #FFFFFF; box-shadow: 0 6px 16px rgba(63, 184, 113, 0.25); }
.ap-btn-whatsapp:hover { background-color: #35A363; }
.ap-btn-kaspi { background-color: #E5503F; color: #FFFFFF; box-shadow: 0 6px 18px rgba(229, 80, 63, 0.25); }
.ap-btn-kaspi:hover { background-color: #CF4434; }

/* ---------- Теги характера (character_tags): 2 строгие категории ---------- */
.ap-tag-trait { background-color: #E0F0FF; color: #1E4976; }   /* Категория 1: черты характера */
.ap-tag-skill { background-color: #FFF2CC; color: #664500; }   /* Категория 2: навыки, социализация, здоровье */

/* ---------- Прочие плашки (не теги характера) ---------- */
.ap-tag-social { background-color: #E2F6EA; color: #2C2A29; }   /* «Ладит с детьми / с животными» в карточке */
.ap-tag-care   { background-color: #FFE5DD; color: #2C2A29; }   /* «Лучше без маленьких детей» и т. п. */
.ap-tag-energy { background-color: #FDF3D7; color: #2C2A29; }   /* бейдж «Чипирование при передаче» */

/* ---------- Фото и свечение ---------- */
.ap-photo { aspect-ratio: 4 / 3; }
.ap-portrait { aspect-ratio: 4 / 5; }
.ap-photo-fade {
  background: linear-gradient(to bottom, rgba(44, 42, 41, 0.50) 0%, rgba(44, 42, 41, 0.16) 45%, rgba(44, 42, 41, 0) 75%);
}
.ap-photo-fade-bottom {
  background: linear-gradient(to top, rgba(44, 42, 41, 0.65) 0%, rgba(44, 42, 41, 0) 100%);
}
.ap-hero-glow {
  background:
    radial-gradient(55% 60% at 80% 25%, rgba(242, 106, 75, 0.20) 0%, rgba(250, 247, 242, 0) 70%),
    radial-gradient(45% 55% at 5% 90%, rgba(76, 175, 125, 0.20) 0%, rgba(250, 247, 242, 0) 70%);
}

.ap-no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
.ap-no-scrollbar::-webkit-scrollbar { display: none; }

/* Плавное раскрытие панели «Расширенный поиск» */
.ap-collapse { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 0.35s ease, opacity 0.3s ease; }
.ap-collapse.is-open { grid-template-rows: 1fr; opacity: 1; }
.ap-collapse > div { min-height: 0; overflow: hidden; }

/* Модальные окна */
.ap-backdrop { animation: ap-fade 0.25s ease both; }
.ap-modal-panel { max-height: 92vh; animation: ap-slide-up 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
.ap-toast { animation: ap-slide-up 0.25s ease both; }

/* Микро-анимации */
.ap-pop { animation: ap-pop 0.45s cubic-bezier(0.2, 0.8, 0.2, 1); }
.ap-float { animation: ap-float 6s ease-in-out infinite; }
.ap-float-slow { animation: ap-float 7s ease-in-out 1.2s infinite; }
.ap-float-late { animation: ap-float 6.5s ease-in-out 2.4s infinite; }

@keyframes ap-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes ap-slide-up { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
@keyframes ap-pop { 0% { transform: scale(1); } 35% { transform: scale(1.35); } 60% { transform: scale(0.9); } 100% { transform: scale(1); } }
@keyframes ap-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

@media (prefers-reduced-motion: reduce) {
  .ap-backdrop, .ap-modal-panel, .ap-toast, .ap-pop, .ap-float, .ap-float-slow, .ap-float-late { animation: none; }
  .ap-collapse { transition: none; }
}
`;

function GlobalStyles() {
  return <style>{GLOBAL_CSS}</style>;
}

/* ---------------------------------------------------------------------
 * Теги характера: 2 строгие категории
 *   1 — черты характера (по умолчанию): синий  .ap-tag-trait
 *   2 — навыки, социализация, здоровье:  янтарь .ap-tag-skill
 * Маркеры — основы слов, чтобы ловить формы: «лотк» → лоток / к лотку,
 * «поводк» → поводка / поводке (плюс «поводок» отдельно).
 * --------------------------------------------------------------------- */
const SKILL_MARKERS = ['привит', 'лоток', 'лотк', 'поводок', 'поводк', 'ладит', 'учится', 'медуход', 'стерилиз'];

const TAG_CATEGORY_CLASS = { 1: 'ap-tag-trait', 2: 'ap-tag-skill' };

function getTagCategory(tag) {
  const t = String(tag).toLowerCase();
  return SKILL_MARKERS.some((marker) => t.includes(marker)) ? 2 : 1;
}

function tagClass(tag) {
  return TAG_CATEGORY_CLASS[getTagCategory(tag)];
}

// Сначала все черты характера (1), затем навыки и здоровье (2); внутри группы — исходный порядок
function sortTagsByCategory(tags) {
  return tags
    .map((tag, index) => ({ tag, index, category: getTagCategory(tag) }))
    .sort((a, b) => a.category - b.category || a.index - b.index)
    .map((item) => item.tag);
}

const FAVORITES_KEY = 'astanapets:favorites';

function loadFavorites() {
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

/* =====================================================================
 * 6. БАЗОВЫЕ UI-КОМПОНЕНТЫ
 * ===================================================================== */

function Chip({ active, onClick, children, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 px-4 py-2 text-sm transition-all duration-300 active:scale-95 ${
        active
          ? 'ap-chip-active font-bold'
          : 'ap-chip-idle font-semibold'
      }`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

const SPECIES_TABS = [
  { value: 'all', label: 'Все питомцы', icon: PawPrint },
  { value: 'dog', label: 'Собаки', icon: Dog },
  { value: 'cat', label: 'Кошки', icon: Cat },
];

function SpeciesTabs({ value, onChange }) {
  return (
    <div role="tablist" aria-label="Вид животного" className="grid grid-cols-3 gap-1.5 rounded-2xl ap-sand-deep p-1.5">
      {SPECIES_TABS.map((tab) => {
        const active = value === tab.value;
        const Icon = tab.icon;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={`flex items-center justify-center gap-2 rounded-xl px-2 py-3 text-sm transition-all duration-300 sm:text-base ${
              active
                ? 'ap-btn-accent font-bold'
                : 'ap-tab-idle font-semibold'
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="truncate">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Toggle({ checked, onChange, label, icon: Icon }) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3 transition-all duration-300 ${
        checked
          ? 'ap-toggle-active'
          : 'ap-toggle-idle'
      }`}
    >
      <span className="flex items-center gap-2.5 text-sm font-semibold">
        <Icon className={`h-4 w-4 shrink-0 ${checked ? 'ap-text-main' : 'ap-text-sage-deep'}`} />
        {label}
      </span>
      <span className="relative inline-flex shrink-0">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span
          className={`h-6 w-11 rounded-full transition-colors duration-300 peer-focus-visible:ring-2 peer-focus-visible:ring-stone-300 ${
            checked ? 'ap-track-on' : 'ap-track-off'
          }`}
        />
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full ap-knob transition-transform duration-300 ${checked ? 'translate-x-5' : ''}`}
        />
      </span>
    </label>
  );
}

function ProgressBar({ collected, goal, purpose, compact = false }) {
  if (!goal) return null;
  const pct = Math.min(100, Math.round((collected / goal) * 100));
  const done = collected >= goal;
  return (
    <div className={`rounded-2xl border border-stone-200/70 ${compact ? 'ap-surface p-3' : 'ap-sand p-4'}`}>
      <div className="mb-2 flex items-center justify-between text-xs font-bold">
        <span className="text-stone-500">{done ? 'Сбор закрыт 🎉' : 'Прозрачный сбор'}</span>
        <span className={done ? 'ap-text-sage-deep' : 'ap-text-accent'}>{pct}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full ap-track-off">
        <div
          className={`h-full rounded-full transition-all duration-700 ${done ? 'ap-sage-fill' : 'ap-progress-fill'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs leading-relaxed text-stone-600">
        Собрано <b className="font-extrabold ap-text-main">{formatKZT(collected)}</b> из {formatKZT(goal)}
        {purpose ? <> на {purpose}</> : null}
      </p>
    </div>
  );
}

function FavoriteButton({ active, onToggle, className = '' }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-pressed={active}
      aria-label={active ? 'Убрать из избранного' : 'Сохранить в избранное'}
      className={`flex h-10 w-10 items-center justify-center rounded-full ap-glass ap-shadow-soft backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 ${className}`}
    >
      <Heart
        key={active ? 'on' : 'off'}
        className={`h-5 w-5 transition-colors duration-300 ${active ? 'ap-pop ap-heart-on' : 'text-stone-600'}`}
      />
    </button>
  );
}

function Modal({ open, onClose, children, labelledBy }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
      <div className="ap-backdrop ap-overlay absolute inset-0 backdrop-blur-sm" onClick={onClose} />
      <div className="ap-modal-panel relative flex w-full flex-col overflow-hidden rounded-t-3xl ap-modal-bg ap-shadow-soft sm:max-w-lg sm:rounded-3xl">
        <div className="absolute left-1/2 top-2 z-10 h-1.5 w-12 -translate-x-1/2 rounded-full ap-glass ap-shadow-soft sm:hidden" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full ap-glass text-stone-700 ap-shadow-soft backdrop-blur-sm transition-all duration-300 hover:scale-105"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>
  );
}

function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div key={message} className="ap-toast flex items-center gap-2 rounded-full ap-bg-graphite px-5 py-3 text-sm font-semibold ap-shadow-soft">
        <Check className="h-4 w-4 ap-text-sage" />
        {message}
      </div>
    </div>
  );
}

function PhotoImg({ src, alt, className = '', eager = false }) {
  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      onError={(e) => {
        e.currentTarget.src = FALLBACK_PHOTO;
      }}
      className={className}
    />
  );
}

/* =====================================================================
 * 7. СЕКЦИИ СТРАНИЦЫ
 * ===================================================================== */

function Header({ favoritesCount, favoritesOnly, onToggleFavorites }) {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 ap-header-glass backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl ap-btn-accent">
            <PawPrint className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-extrabold ap-text-main">Лапки Астаны</span>
            <span className="block text-xs font-semibold text-stone-500">AstanaPets</span>
          </span>
        </a>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full ap-sage-soft px-3 py-1.5 text-xs font-bold ap-text-sage-deep sm:inline-flex">
            <MapPin className="h-3.5 w-3.5" />
            Пилотный проект • Астана
          </span>
          <button
            type="button"
            onClick={onToggleFavorites}
            aria-pressed={favoritesOnly}
            aria-label="Избранное"
            className={`relative flex h-10 items-center gap-1.5 rounded-full border-2 px-3 text-sm font-bold transition-all duration-300 ${
              favoritesOnly
                ? 'ap-chip-active'
                : 'ap-chip-idle'
            }`}
          >
            <Heart className={`h-4 w-4 ${favoritesOnly ? 'fill-white' : favoritesCount ? 'ap-heart-on' : ''}`} />
            <span>{favoritesCount}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

const COLLAGE_SLOTS = 3;

/**
 * Собирает 3 слота для коллажа на первом экране.
 * Сначала — реальные питомцы из таблицы; если их меньше трёх (или данные ещё грузятся),
 * недостающие слоты заполняются фото из резервного MOCK_PETS.
 * Резервные фото — только декорация: без клички и без открытия карточки,
 * чтобы посетитель не попал на тестовые контакты.
 */
function buildCollageSlots(pets) {
  const real = pets.slice(0, COLLAGE_SLOTS).map((pet) => ({ pet, isFiller: false }));
  const usedIds = new Set(real.map((slot) => slot.pet.id));
  const usedPhotos = new Set(real.map((slot) => slot.pet.photo_url));
  const fillers = MOCK_PETS.filter((p) => !usedIds.has(p.id) && !usedPhotos.has(p.photo_url))
    .slice(0, COLLAGE_SLOTS - real.length)
    .map((pet) => ({ pet, isFiller: true }));
  return [...real, ...fillers];
}

function HeroCollage({ pets, onOpenPet }) {
  const [a, b, c] = buildCollageSlots(pets);

  const goToCatalog = () => {
    trackEvent('hero_cta_clicked', { action: 'collage_placeholder' });
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const PolaroidPhoto = ({ slot, badge, widthClass, tilt, floatClass, priority }) => {
    if (!slot) return null;
    const { pet, isFiller } = slot;
    return (
      <div className={tilt}>
        <button
          type="button"
          onClick={() => (isFiller ? goToCatalog() : onOpenPet(pet))}
          aria-label={isFiller ? 'Перейти в каталог питомцев' : `Открыть карточку: ${pet.name}`}
          className={`ap-card ap-card-hover group block rounded-3xl p-2 transition-all duration-300 hover:-translate-y-1 ${widthClass} ${floatClass}`}
        >
          <div className="ap-portrait relative overflow-hidden rounded-2xl ap-sand-deep">
            <PhotoImg
              src={pet.photo_url}
              alt={isFiller ? 'Питомец из приюта' : pet.name}
              eager={priority}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="ap-photo-fade-bottom absolute inset-x-0 bottom-0 h-1/3" />
            {badge}
            {!isFiller && (
              <div className="absolute inset-x-3 bottom-3 text-left text-white">
                <p className="text-lg font-extrabold leading-tight">{pet.name}</p>
                <p className="text-xs font-semibold opacity-90">{formatAge(pet.age_months)}</p>
              </div>
            )}
          </div>
        </button>
      </div>
    );
  };

  return (
    <div className="relative mx-auto w-full max-w-xl" style={{ height: 470 }}>
      <div className="absolute left-0 top-8 z-10">
        <PolaroidPhoto
          slot={a}
          priority
          widthClass="w-64"
          tilt="-rotate-3"
          floatClass="ap-float"
          badge={
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full ap-sage px-3 py-1 text-xs font-bold ap-shadow-soft">
              <ShieldCheck className="h-3.5 w-3.5" />
              Спасён в Астане
            </span>
          }
        />
      </div>
      <div className="absolute right-0 top-0">
        <PolaroidPhoto
          slot={b}
          widthClass="w-56"
          tilt="rotate-3"
          floatClass="ap-float-slow"
          badge={
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full ap-btn-accent px-3 py-1 text-xs font-bold">
              <Heart className="h-3.5 w-3.5 fill-white" />
              Ищет семью
            </span>
          }
        />
      </div>
      <div className="absolute bottom-0 right-20 z-20">
        <PolaroidPhoto slot={c} widthClass="w-52" tilt="-rotate-2" floatClass="ap-float-late" badge={null} />
      </div>
      <figure className="ap-card absolute bottom-2 left-4 z-30 w-60 rounded-2xl border border-stone-200/70 p-4">
        <Quote className="h-5 w-5 ap-text-accent" />
        <blockquote className="mt-1 text-sm font-semibold leading-snug text-stone-700">
          Каждого питомца проверил куратор приюта. Вы знакомитесь вживую, без посредников.
        </blockquote>
        <figcaption className="mt-2 text-xs font-bold text-stone-400">— команда AstanaPets</figcaption>
      </figure>
    </div>
  );
}

function MobilePreviewSlider({ pets, onOpenPet }) {
  if (!pets.length) return null;
  return (
    <div className="lg:hidden">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-extrabold ap-text-main">Ждут знакомства</p>
        <p className="flex items-center gap-1 text-xs font-semibold text-stone-500">
          листайте <ChevronRight className="h-3.5 w-3.5" />
        </p>
      </div>
      <div className="ap-no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
        {pets.map((pet, i) => (
          <button
            key={pet.id}
            type="button"
            onClick={() => onOpenPet(pet)}
            className="ap-card group w-36 shrink-0 snap-start rounded-3xl p-1.5 text-left transition-all duration-300 active:scale-95"
          >
            <div className="ap-portrait relative overflow-hidden rounded-2xl ap-sand-deep">
              <PhotoImg src={pet.photo_url} alt={pet.name} eager={i < 2} className="h-full w-full object-cover" />
              <div className="ap-photo-fade-bottom absolute inset-x-0 bottom-0 h-1/2" />
              {i === 0 && (
                <span className="absolute left-2 top-2 rounded-full ap-sage px-2 py-0.5 text-xs font-bold ap-shadow-soft">Спасён в Астане</span>
              )}
              {i === 1 && <span className="absolute left-2 top-2 rounded-full ap-btn-accent px-2 py-0.5 text-xs font-bold">Ищет семью</span>}
              <div className="absolute inset-x-2 bottom-2 text-white">
                <p className="text-base font-extrabold leading-tight">{pet.name}</p>
                <p className="text-xs font-semibold opacity-90">{formatAge(pet.age_months)}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Hero({ petsCount, sheltersCount, previewPets, onOpenPet }) {
  const scrollTo = (id, action) => {
    trackEvent('hero_cta_clicked', { action });
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section id="top" className="relative overflow-hidden">
      <div className="ap-hero-glow pointer-events-none absolute inset-0" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 pb-6 pt-8 sm:pt-12 lg:grid-cols-2 lg:gap-12 lg:pb-16 lg:pt-16">
        <div>
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full ap-accent-soft px-3 py-1.5 text-xs font-bold ap-text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            Приюты Астаны — в одном месте
          </span>
          <h1 className="text-3xl font-extrabold leading-tight tracking-normal ap-text-main sm:text-4xl lg:text-5xl">
            Найди друга из приюта в Астане и <span className="ap-text-accent">помоги тем, кто ещё ждёт дом</span>
          </h1>

          <div className="ap-card mt-6 inline-flex items-center gap-3 rounded-2xl border border-stone-200/70 px-4 py-3 text-sm text-stone-600">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full ap-sage-fill opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full ap-sage-fill" />
            </span>
            <span className="font-semibold">
              Сейчас ищут дом: <b className="font-extrabold ap-text-main">{petsCount}</b> {pluralRu(petsCount, ['питомец', 'питомца', 'питомцев'])} из{' '}
              <b className="font-extrabold ap-text-main">{sheltersCount}</b>{' '}
              {pluralRu(sheltersCount, ['проверенного приюта', 'проверенных приютов', 'проверенных приютов'])}
            </span>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => scrollTo('catalog', 'choose_pet')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl ap-btn-accent px-7 py-4 text-base font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
            >
              <PawPrint className="h-5 w-5" />
              Выбрать питомца
            </button>
            <button
              type="button"
              onClick={() => scrollTo('help', 'help_shelters')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 ap-chip-idle px-7 py-4 text-base font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
            >
              <Heart className="h-5 w-5 ap-text-accent" />
              Помочь приютам
            </button>
          </div>

          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-stone-600">
            <li className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 ap-text-sage-deep" />
              Проверенные приюты
            </li>
            <li className="flex items-center gap-1.5">
              <Wallet className="h-4 w-4 ap-text-sage-deep" />
              0% комиссии
            </li>
            <li className="flex items-center gap-1.5">
              <Cpu className="h-4 w-4 ap-text-sage-deep" />
              Чип по стандарту РК
            </li>
          </ul>
        </div>

        <div className="hidden lg:block">
          <HeroCollage pets={previewPets} onOpenPet={onOpenPet} />
        </div>

        <MobilePreviewSlider pets={previewPets} onOpenPet={onOpenPet} />
      </div>
    </section>
  );
}

const ADVANCED_KEYS = [
  'sex',
  'age',
  'size',
  'chippedOnly',
  'sterilized',
  'vaccinated',
  'goodWithKids',
  'goodWithAnimals',
  'apartmentFriendly',
  'beginnerFriendly',
  'openFundraising',
];

function Filters({ filters, setFilter, reset, resultsCount }) {
  const [open, setOpen] = useState(false);
  const dirty = isFiltersDirty(filters);
  const advancedCount = ADVANCED_KEYS.filter((k) => filters[k] !== DEFAULT_FILTERS[k]).length;
  const advancedGroups = FILTER_GROUPS.filter((g) => g.key !== 'species');
  const highlighted = open || advancedCount > 0;

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    trackEvent('advanced_filters_toggled', { open: next, active_filters: advancedCount });
  };

  return (
    <div className="ap-card space-y-4 rounded-3xl border border-stone-200/70 p-4 sm:p-5">
      <SpeciesTabs value={filters.species} onChange={(v) => setFilter('species', v)} />

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => setFilter('query', e.target.value, { silent: true })}
            placeholder="Поиск по кличке или описанию"
            className="ap-input h-12 w-full rounded-2xl border-2 pl-12 pr-4 text-base font-semibold transition-all duration-300 placeholder:font-medium placeholder:text-stone-400 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={toggleOpen}
          aria-expanded={open}
          aria-controls="advanced-filters"
          className={`inline-flex h-12 items-center justify-center gap-2 rounded-2xl border-2 px-5 text-sm font-bold transition-all duration-300 ${
            highlighted ? 'ap-btn-outline-accent' : 'ap-chip-idle'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Расширенный поиск
          {advancedCount > 0 && (
            <span className="inline-flex h-6 items-center justify-center rounded-full ap-btn-accent px-2 text-xs font-extrabold">
              {advancedCount}
            </span>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div id="advanced-filters" className={`ap-collapse ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <div>
          <div className="space-y-4 border-t border-stone-200/70 pt-4">
            {advancedGroups.map((group) => (
              <div key={group.key}>
                <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-stone-500">{group.label}</p>
                <div className="ap-no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
                  {group.options.map((opt) => (
                    <Chip key={opt.value} icon={opt.icon} active={filters[group.key] === opt.value} onClick={() => setFilter(group.key, opt.value)}>
                      {opt.label}
                    </Chip>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-stone-500">Здоровье и характер</p>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {TOGGLES.map((t) => (
                  <Toggle key={t.key} icon={t.icon} label={t.label} checked={filters[t.key]} onChange={(v) => setFilter(t.key, v)} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-stone-600">
          Найдено: <b className="font-extrabold ap-text-main">{resultsCount}</b>
        </p>
        {dirty && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold ap-text-accent ap-hover-accent-soft transition-all duration-300"
          >
            <RotateCcw className="h-4 w-4" />
            Сбросить фильтры
          </button>
        )}
      </div>
    </div>
  );
}

function PetCard({ pet, onOpen, onDonate, isFavorite, onToggleFavorite }) {
  const tags = sortTagsByCategory(splitTags(pet.character_tags)).slice(0, 4);

  return (
    <article className="ap-card ap-card-hover group flex flex-col overflow-hidden rounded-3xl border border-stone-200/70 transition-all duration-300 hover:-translate-y-1">
      <div className="ap-photo relative w-full overflow-hidden ap-sand-deep">
        <button type="button" onClick={() => onOpen(pet)} aria-label={`Открыть карточку: ${pet.name}`} className="absolute inset-0 block h-full w-full">
          <PhotoImg
            src={pet.photo_url}
            alt={`${pet.name} — ${pet.species === 'dog' ? 'собака' : 'кошка'} из приюта`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </button>
        <div className="ap-photo-fade pointer-events-none absolute inset-x-0 top-0 h-2/3" />
        <div className="pointer-events-none absolute left-3 right-16 top-3 flex flex-col items-start gap-1.5">
          {pet.shelter_verified && (
            <span className="inline-flex items-center gap-1 rounded-full ap-sage px-2.5 py-1 text-xs font-bold ap-shadow-soft">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              Проверен: {pet.shelter_name}
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ap-shadow-soft ${
              pet.chip_number ? 'ap-surface ap-text-main' : 'ap-tag-energy'
            }`}
          >
            <Cpu className="h-3.5 w-3.5 shrink-0" />
            {pet.chip_number ? `Чип №${pet.chip_number}` : 'Чипирование при передаче'}
          </span>
        </div>
        <FavoriteButton active={isFavorite} onToggle={() => onToggleFavorite(pet)} className="absolute right-3 top-3" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-2xl font-extrabold tracking-normal ap-text-main">{pet.name}</h3>
          <p className="mt-0.5 text-sm font-semibold text-stone-500">
            {SEX_LABEL[pet.sex]} · {formatAge(pet.age_months)} · {SIZE_LABEL[pet.size]}
          </p>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span key={t} className={`rounded-full px-3 py-1 text-xs font-bold ${tagClass(t)}`}>
                {t}
              </span>
            ))}
          </div>
        )}

        <ProgressBar compact collected={pet.fundraising_collected_kzt} goal={pet.fundraising_goal_kzt} purpose={pet.fundraising_purpose} />

        <div className="mt-auto flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => onOpen(pet)}
            className="inline-flex flex-1 items-center justify-center rounded-2xl ap-btn-accent px-4 py-3.5 text-sm font-bold transition-all duration-300 active:scale-95"
          >
            Познакомиться / Забрать
          </button>
          <button
            type="button"
            onClick={() => onDonate(pet)}
            className="inline-flex items-center justify-center gap-1.5 rounded-2xl border-2 ap-btn-accent-soft px-4 py-3 text-sm font-bold transition-all duration-300 active:scale-95"
          >
            <Heart className="h-4 w-4" />
            Помочь
          </button>
        </div>
      </div>
    </article>
  );
}

function StatusRow({ label, ok, okText = 'Да', noText = 'Нет', extra }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <span className="text-sm font-semibold text-stone-600">{label}</span>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
          ok ? 'ap-sage' : 'ap-sand-deep text-stone-600'
        }`}
      >
        {ok ? <Check className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
        {ok ? extra || okText : noText}
      </span>
    </div>
  );
}

function PetDetailsModal({ pet, onClose, onDonate, notify, isFavorite, onToggleFavorite }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => setRevealed(false), [pet?.id]);

  if (!pet) return null;

  const tags = sortTagsByCategory(splitTags(pet.character_tags));
  const waText = `Здравствуйте! Увидел(а) ${pet.name} на сайте AstanaPets, хочу узнать подробнее...`;
  const waLink = `https://wa.me/${pet.curator_whatsapp}?text=${encodeURIComponent(waText)}`;
  const base = { pet_id: pet.id, pet_name: pet.name, shelter: pet.shelter_name };

  const reveal = () => {
    setRevealed(true);
    trackEvent('reveal_contacts_clicked', base);
  };

  const copyPhone = async () => {
    const ok = await copyToClipboard(pet.curator_phone);
    notify(ok ? 'Номер скопирован' : 'Не удалось скопировать');
    trackEvent('curator_phone_copied', base);
  };

  return (
    <Modal open={!!pet} onClose={onClose} labelledBy="pet-modal-title">
      <div className="ap-photo relative w-full ap-sand-deep">
        <PhotoImg src={pet.photo_url} alt={pet.name} eager className="h-full w-full object-cover" />
        <div className="ap-photo-fade pointer-events-none absolute inset-x-0 top-0 h-1/2" />
        {pet.shelter_verified && (
          <span className="absolute left-3 top-5 inline-flex items-center gap-1 rounded-full ap-sage px-3 py-1 text-xs font-bold ap-shadow-soft sm:top-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            Проверен: {pet.shelter_name}
          </span>
        )}
        <FavoriteButton active={isFavorite} onToggle={() => onToggleFavorite(pet)} className="absolute right-16 top-3" />
      </div>

      <div className="space-y-6 p-5 pb-8 sm:p-6">
        <div>
          <h2 id="pet-modal-title" className="text-3xl font-extrabold tracking-normal ap-text-main">
            {pet.name}
          </h2>
          <p className="mt-1 text-sm font-semibold text-stone-500">
            {pet.species === 'dog' ? 'Собака' : 'Кошка'} · {SEX_LABEL[pet.sex]} · {formatAge(pet.age_months)} · {SIZE_LABEL[pet.size]}
          </p>
          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span key={t} className={`rounded-full px-3 py-1 text-xs font-bold ${tagClass(t)}`}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        <section>
          <h3 className="mb-2 text-lg font-extrabold ap-text-main">История и характер</h3>
          <p className="ap-prose text-base text-stone-600">{pet.description}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
            <span className={`rounded-full px-3 py-1 ${pet.good_with_kids ? 'ap-tag-social' : 'ap-tag-care'}`}>
              {pet.good_with_kids ? '✓ Ладит с детьми' : 'Лучше без маленьких детей'}
            </span>
            <span className={`rounded-full px-3 py-1 ${pet.good_with_animals ? 'ap-tag-social' : 'ap-tag-care'}`}>
              {pet.good_with_animals ? '✓ Ладит с животными' : 'Лучше единственным питомцем'}
            </span>
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-lg font-extrabold ap-text-main">Здоровье и документы</h3>
          <div className="divide-y divide-stone-200/70 overflow-hidden rounded-2xl border border-stone-200/70 ap-sand">
            <StatusRow label="Чип" ok={!!pet.chip_number} extra={`№${pet.chip_number}`} noText="При передаче" />
            <StatusRow label="Регистрация в базе учёта" ok={pet.is_registered} okText="Зарегистрирован" noText="При передаче" />
            <StatusRow label="Вакцинация" ok={pet.is_vaccinated} okText="Привит" />
            <StatusRow label="Стерилизация / кастрация" ok={pet.is_sterilized} okText="Выполнена" noText="Пока нет" />
            <StatusRow label="Обработка от паразитов" ok={pet.is_parasite_treated} okText="Выполнена" noText="Пока нет" />
          </div>
          <p className="mt-2 flex items-start gap-1.5 text-xs font-medium text-stone-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            По правилам ответственного обращения с животными в РК питомец должен быть идентифицирован (чип) и зарегистрирован на нового владельца.
          </p>
        </section>

        <ProgressBar collected={pet.fundraising_collected_kzt} goal={pet.fundraising_goal_kzt} purpose={pet.fundraising_purpose} />

        <section>
          <h3 className="mb-3 text-lg font-extrabold ap-text-main">Как забрать питомца</h3>
          <ol className="space-y-2">
            {['Связаться с куратором', 'Познакомиться в приюте', 'Оформить передачу и регистрацию чипа'].map((step, i) => (
              <li key={step} className="flex items-center gap-3 rounded-2xl border border-stone-200/70 ap-sand px-4 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full ap-btn-accent text-sm font-extrabold">
                  {i + 1}
                </span>
                <span className="text-sm font-bold ap-text-main">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-3">
          {!revealed ? (
            <button
              type="button"
              onClick={reveal}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl ap-btn-accent px-5 py-4 text-base font-bold transition-all duration-300 active:scale-95"
            >
              <Phone className="h-5 w-5" />
              Показать контакты куратора
            </button>
          ) : (
            <div className="ap-toast space-y-3 rounded-2xl border-2 ap-sage-panel p-4">
              <p className="text-sm font-semibold text-stone-600">
                Куратор: <b className="font-extrabold ap-text-main">{pet.curator_name}</b> · {pet.shelter_name}
              </p>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('whatsapp_clicked', base)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl ap-btn-whatsapp px-5 py-3.5 text-base font-bold transition-all duration-300 active:scale-95"
              >
                <MessageCircle className="h-5 w-5" />
                Написать в WhatsApp
              </a>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${pet.curator_phone.replace(/\s/g, '')}`}
                  onClick={() => trackEvent('curator_phone_called', base)}
                  className="flex h-12 flex-1 items-center gap-2 rounded-2xl border-2 ap-field px-4 text-base font-extrabold"
                >
                  <Phone className="h-4 w-4 text-stone-500" />
                  {pet.curator_phone}
                </a>
                <button
                  type="button"
                  onClick={copyPhone}
                  aria-label="Скопировать номер"
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 ap-chip-idle transition-all duration-300 active:scale-95"
                >
                  <Copy className="h-5 w-5" />
                </button>
              </div>
              {pet.shelter_instagram && (
                <a
                  href={pet.shelter_instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('instagram_clicked', base)}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-stone-700 ap-link"
                >
                  <Instagram className="h-4 w-4" />
                  Instagram приюта
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => onDonate(pet)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 ap-btn-accent-soft px-5 py-3 text-sm font-bold transition-all duration-300"
          >
            <Heart className="h-4 w-4" />
            Помочь приюту «{pet.shelter_name}»
          </button>
        </section>
      </div>
    </Modal>
  );
}

function DonateModal({ target, onClose, notify }) {
  if (!target) return null;
  const { shelter, pet } = target;
  const base = { shelter: shelter.shelter_name, pet_id: pet?.id || null, pet_name: pet?.name || null };

  const copyKaspi = async () => {
    const ok = await copyToClipboard(shelter.kaspi_phone);
    notify(ok ? 'Номер Kaspi скопирован' : 'Не удалось скопировать');
    trackEvent('kaspi_phone_copied', base);
  };

  return (
    <Modal open={!!target} onClose={onClose} labelledBy="donate-modal-title">
      <div className="space-y-5 p-5 pb-8 pt-8 sm:p-6 sm:pt-8">
        <div className="pr-12">
          <span className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl ap-btn-accent">
            <Heart className="h-7 w-7 fill-white" />
          </span>
          <h2 id="donate-modal-title" className="text-2xl font-extrabold tracking-normal ap-text-main">
            Помочь приюту «{shelter.shelter_name}»
          </h2>
          {pet && <p className="mt-1 text-sm font-semibold text-stone-500">Сбор в карточке: {pet.name}</p>}
        </div>

        <div className="flex items-start gap-3 rounded-2xl ap-sage p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm font-semibold leading-relaxed">
            <b className="font-extrabold">0% комиссии.</b> Перевод уходит напрямую на официальные реквизиты приюта «{shelter.shelter_name}».
          </p>
        </div>

        {pet && <ProgressBar collected={pet.fundraising_collected_kzt} goal={pet.fundraising_goal_kzt} purpose={pet.fundraising_purpose} />}

        <div className="rounded-2xl border border-stone-200/70 ap-sand p-4">
          <p className="text-xs font-extrabold uppercase tracking-wide text-stone-500">На что идут средства</p>
          <p className="mt-1 text-base font-semibold ap-text-main">{shelter.donation_usage}</p>
          {shelter.reports_url && (
            <a
              href={shelter.reports_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('reports_link_clicked', base)}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-stone-700 underline decoration-stone-300 underline-offset-4 ap-link"
            >
              <Instagram className="h-4 w-4" />
              Отчёты приюта в Instagram
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        <a
          href={shelter.kaspi_link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent('kaspi_link_clicked', base)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl ap-btn-kaspi px-5 py-4 text-base font-bold transition-all duration-300 active:scale-95"
        >
          <Wallet className="h-5 w-5" />
          Перевести через Kaspi
        </a>

        <div>
          <p className="mb-2 text-sm font-semibold text-stone-600">Или по номеру Kaspi Gold куратора ({shelter.curator_name}):</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex h-12 flex-1 items-center rounded-2xl border-2 ap-field px-4 text-base font-extrabold">
              {shelter.kaspi_phone}
            </div>
            <button
              type="button"
              onClick={copyKaspi}
              className="inline-flex h-12 items-center justify-center gap-1.5 rounded-2xl ap-bg-graphite px-5 text-sm font-bold transition-all duration-300 active:scale-95"
            >
              <Copy className="h-4 w-4" />
              Скопировать номер
            </button>
          </div>
        </div>

        <p className="text-xs font-medium leading-relaxed text-stone-500">
          AstanaPets не принимает деньги и не видит ваши платежи. Пожалуйста, проверяйте имя получателя в Kaspi перед переводом.
        </p>
      </div>
    </Modal>
  );
}

function SheltersSection({ shelters, onDonate }) {
  return (
    <section id="help" className="scroll-mt-20 border-y border-stone-200/70">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <span className="inline-flex items-center gap-1.5 rounded-full ap-accent-soft px-3 py-1 text-xs font-bold ap-text-accent">
          <Heart className="h-3.5 w-3.5 ap-heart-on" />
          Прозрачные пожертвования
        </span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-normal ap-text-main sm:text-4xl">Помочь приютам</h2>
        <p className="mt-2 max-w-2xl text-base text-stone-600">
          Даже 1 000 ₸ — это корм на день для нескольких животных. Переводы идут напрямую приютам, без посредников и комиссий.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shelters.map((s) => (
            <div
              key={s.shelter_name}
              className="ap-card ap-card-hover flex flex-col gap-3 rounded-3xl border border-stone-200/70 p-6 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-xl font-extrabold ap-text-main">{s.shelter_name}</h3>
                {s.shelter_verified && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full ap-sage px-2.5 py-1 text-xs font-bold">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Проверен
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-stone-600">{s.donation_usage}</p>
              <p className="text-sm font-semibold text-stone-500">
                Ищут дом: <b className="font-extrabold ap-text-main">{s.petsCount}</b> {pluralRu(s.petsCount, ['питомец', 'питомца', 'питомцев'])}
              </p>
              <button
                type="button"
                onClick={() => onDonate(null, s)}
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-2xl ap-btn-accent px-4 py-3.5 text-sm font-bold transition-all duration-300 active:scale-95"
              >
                <Heart className="h-4 w-4" />
                Помочь приюту
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="ap-sand">
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-10">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl ap-btn-accent">
            <PawPrint className="h-4 w-4" />
          </span>
          <span className="text-lg font-extrabold ap-text-main">Лапки Астаны · AstanaPets</span>
        </div>
        <p className="max-w-3xl text-sm font-medium leading-relaxed text-stone-600">
          Сервис носит информационный характер и помогает приютам Астаны находить дом для животных. Площадка не принимает денежные средства и не
          является стороной передачи животного — все переводы и договорённости происходят напрямую с проверенными приютами и кураторами.
        </p>
        <p className="text-xs font-semibold text-stone-400">© {new Date().getFullYear()} AstanaPets · Пилотный проект · Астана, Казахстан</p>
      </div>
    </footer>
  );
}

/* =====================================================================
 * 8. ПРИЛОЖЕНИЕ
 * ===================================================================== */

export default function App() {
  const [pets, setPets] = useState([]);
  const [shelterRows, setShelterRows] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [activePet, setActivePet] = useState(null);
  const [donateTarget, setDonateTarget] = useState(null);
  const [toast, setToast] = useState('');
  const [favorites, setFavorites] = useState(loadFavorites);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchData()
      .then(({ pets: petRows, shelters: sheltersFromSheet }) => {
        if (!alive) return;
        setPets(petRows.map(normalizePet));
        setShelterRows(sheltersFromSheet ? sheltersFromSheet.map(normalizeShelter) : null);
      })
      .catch((e) => console.error('Не удалось загрузить данные', e))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  // Поиск трекаем с задержкой, чтобы не слать событие на каждую букву
  useEffect(() => {
    const q = filters.query.trim();
    if (!q) return undefined;
    const t = setTimeout(() => trackEvent('filter_applied', { filter: 'query', value: q }), 800);
    return () => clearTimeout(t);
  }, [filters.query]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  // Избранное хранится только в браузере пользователя (без регистрации)
  useEffect(() => {
    try {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (_) {
      /* хранилище недоступно — избранное живёт до перезагрузки */
    }
  }, [favorites]);

  const availablePets = useMemo(() => pets.filter((p) => !p.status || p.status === 'available'), [pets]);
  const filtered = useMemo(() => applyFilters(availablePets, filters), [availablePets, filters]);
  const shown = useMemo(() => (favoritesOnly ? filtered.filter((p) => favorites.includes(p.id)) : filtered), [filtered, favorites, favoritesOnly]);

  // Секция «Помочь приютам»: из листа `shelters`, а если его нет — собирается из строк питомцев.
  // petsCount — сколько активных (available) животных этого приюта сейчас в каталоге.
  const shelters = useMemo(() => {
    const counts = new Map();
    availablePets.forEach((p) => {
      const key = shelterKey(p.shelter_name);
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    if (shelterRows && shelterRows.length > 0) {
      return shelterRows.map((sh) => ({ ...sh, petsCount: counts.get(shelterKey(sh.shelter_name)) || 0 }));
    }

    const map = new Map();
    availablePets.forEach((p) => {
      const key = shelterKey(p.shelter_name);
      if (!map.has(key)) map.set(key, { ...shelterFromPet(p), petsCount: counts.get(key) });
    });
    return [...map.values()];
  }, [availablePets, shelterRows]);

  const activeSheltersCount = useMemo(() => shelters.filter((sh) => sh.petsCount > 0).length, [shelters]);

  const setFilter = useCallback((key, value, opts = {}) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (!opts.silent) trackEvent('filter_applied', { filter: key, value });
  }, []);

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    trackEvent('filter_applied', { filter: 'reset', value: true });
  };

  const openPet = (pet) => {
    setActivePet(pet);
    trackEvent('pet_card_opened', { pet_id: pet.id, pet_name: pet.name, shelter: pet.shelter_name });
  };

  const openDonate = (pet, shelterOverride) => {
    const shelter =
      shelterOverride ||
      shelters.find((sh) => shelterKey(sh.shelter_name) === shelterKey(pet.shelter_name)) ||
      shelterFromPet(pet);
    if (!shelter) return;
    setActivePet(null);
    setDonateTarget({ shelter, pet });
    trackEvent('donate_modal_opened', {
      shelter: shelter.shelter_name,
      pet_id: pet?.id || null,
      pet_name: pet?.name || null,
      source: pet ? 'pet_card' : 'shelters_section',
    });
  };

  const toggleFavorite = (pet) => {
    const wasFavorite = favorites.includes(pet.id);
    setFavorites((prev) => (wasFavorite ? prev.filter((id) => id !== pet.id) : [...prev, pet.id]));
    if (!wasFavorite) setToast(`${pet.name} в избранном`);
    trackEvent('favorite_toggled', {
      pet_id: pet.id,
      pet_name: pet.name,
      shelter: pet.shelter_name,
      action: wasFavorite ? 'removed' : 'added',
    });
  };

  const toggleFavoritesView = () => {
    const next = !favoritesOnly;
    setFavoritesOnly(next);
    trackEvent('favorites_view_toggled', { open: next, count: favorites.length });
    if (next) document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="ap-root min-h-screen ap-text-main antialiased">
      <GlobalStyles />
      <Header favoritesCount={favorites.length} favoritesOnly={favoritesOnly} onToggleFavorites={toggleFavoritesView} />
      <main>
        <Hero petsCount={availablePets.length} sheltersCount={activeSheltersCount} previewPets={availablePets} onOpenPet={openPet} />

        <section id="catalog" className="scroll-mt-20">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-3xl font-extrabold tracking-normal ap-text-main sm:text-4xl">Каталог питомцев</h2>
              {favoritesOnly && (
                <button
                  type="button"
                  onClick={toggleFavoritesView}
                  className="inline-flex items-center gap-1.5 rounded-full border-2 ap-chip-active px-4 py-2 text-sm font-bold transition-all duration-300"
                >
                  <Heart className="h-4 w-4 fill-white" />
                  Только избранное
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Filters filters={filters} setFilter={setFilter} reset={resetFilters} resultsCount={shown.length} />

            <div className="mt-6">
              {loading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-96 animate-pulse rounded-3xl ap-sand-deep" />
                  ))}
                </div>
              ) : shown.length === 0 ? (
                <div className="ap-card rounded-3xl border-2 border-dashed border-stone-200 p-10 text-center">
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full ap-accent-soft">
                    {favoritesOnly ? <Heart className="h-8 w-8 ap-text-accent" /> : <PawPrint className="h-8 w-8 ap-text-accent" />}
                  </span>
                  <p className="mt-4 text-lg font-extrabold ap-text-main">
                    {favoritesOnly ? 'В избранном пока пусто' : 'Никого не нашли по этим фильтрам'}
                  </p>
                  <p className="mt-1 text-sm font-medium text-stone-500">
                    {favoritesOnly
                      ? 'Нажмите на сердечко на фото питомца, чтобы сохранить его здесь.'
                      : 'Попробуйте смягчить условия — возможно, ваш друг совсем рядом.'}
                  </p>
                  <button
                    type="button"
                    onClick={favoritesOnly ? toggleFavoritesView : resetFilters}
                    className="mt-5 inline-flex items-center gap-1.5 rounded-2xl ap-btn-accent px-5 py-3 text-sm font-bold transition-all duration-300"
                  >
                    <RotateCcw className="h-4 w-4" />
                    {favoritesOnly ? 'Показать всех' : 'Сбросить фильтры'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {shown.map((pet) => (
                    <PetCard
                      key={pet.id}
                      pet={pet}
                      onOpen={openPet}
                      onDonate={openDonate}
                      isFavorite={favorites.includes(pet.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <SheltersSection shelters={shelters} onDonate={openDonate} />
      </main>
      <Footer />

      <PetDetailsModal
        pet={activePet}
        onClose={() => setActivePet(null)}
        onDonate={openDonate}
        notify={setToast}
        isFavorite={activePet ? favorites.includes(activePet.id) : false}
        onToggleFavorite={toggleFavorite}
      />
      <DonateModal target={donateTarget} onClose={() => setDonateTarget(null)} notify={setToast} />
      <Toast message={toast} />
    </div>
  );
}
