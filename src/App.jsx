import React, { useEffect, useLayoutEffect, useMemo, useState, useCallback, useRef } from 'react';
import { loadSheet } from './sheetSource.js';
import { DEMO_BUILD } from './demoConfig.js';
import {
  PawPrint,
  ShieldCheck,
  Search,
  Heart,
  X,
  Cpu,
  Check,
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
  HelpCircle,
  Calendar,
  Ruler,
  Tag,
  Award,
  Bug,
  FileText,
  Camera,
  ChevronLeft,
  Menu,
  Sun,
  Moon,
  Send,
  AlertTriangle,
  RefreshCw,
  Share,
} from 'lucide-react';

/* =====================================================================
 * СВЯЗЬ С АВТОРОМ В TELEGRAM
 * Впишите свой username без символа @ (например: 'astanapets_admin').
 * ===================================================================== */
const AUTHOR_TELEGRAM_USERNAME = 'astpets';
const TELEGRAM_DEFAULT_MESSAGE = 'Здравствуйте! Пишу с сайта AstanaPets по поводу...';

/**
 * Открывает чат с автором в Telegram.
 * Внутри Telegram Mini App — нативным методом, в обычном браузере — новой вкладкой
 * (на телефонах ссылка t.me сразу открывает приложение Telegram).
 * trackEvent объявлен ниже как function, поэтому доступен здесь при вызове.
 */
function openAuthorTelegram() {
  trackEvent('author_telegram_clicked', { username: AUTHOR_TELEGRAM_USERNAME });
  const url = `https://t.me/${AUTHOR_TELEGRAM_USERNAME}?text=${encodeURIComponent(TELEGRAM_DEFAULT_MESSAGE)}`;
  const webApp = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;
  if (webApp && typeof webApp.openTelegramLink === 'function') {
    webApp.openTelegramLink(url);
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

/* =====================================================================
 * 1. АНАЛИТИКА
 * ===================================================================== */

// Укажите номер счётчика Яндекс.Метрики, когда подключите его в index.html
const YM_COUNTER_ID = 114363784;

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

  if (typeof window === 'undefined' || DEMO_BUILD) return; // демо-версия не портит статистику основного сайта

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
 * Все поля «плоские»: строки, числа, булевы.
 * photo_url может содержать несколько ссылок через «|» (или с новой строки) — первая станет обложкой.
 * Совместимость (good_with_kids / good_with_dogs / good_with_cats / good_with_animals)
 * принимает YES / NO / UNKNOWN, а также TRUE / FALSE; пустая ячейка = «Неизвестно». Списки (теги) — строка через «|»,
 * как удобно хранить в ячейке таблицы.
 *
 * Столбцы таблицы:
 * id | status | name | species | sex | age_months | size | photo_url | description |
 * character_tags | shelter_name | shelter_verified | shelter_instagram | reports_url |
 * curator_name | curator_phone | curator_whatsapp | kaspi_phone | kaspi_link |
 * chip_number | is_registered | is_vaccinated | is_sterilized | is_parasite_treated |
 * good_with_kids | good_with_dogs | good_with_cats | good_with_animals | breed | house_trained | apartment_friendly | beginner_friendly | fundraising_goal_kzt | fundraising_collected_kzt |
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
    // Несколько фото через «|» — так же, как в ячейке Google Таблицы
    photo_url: [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&h=1100&q=80',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
    ].join('|'),
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
    good_with_dogs: 'NO',
    good_with_cats: 'UNKNOWN',
    breed: 'Метис овчарки',
    house_trained: true,
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
    // Несколько фото через «|» — так же, как в ячейке Google Таблицы
    photo_url: [
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&h=1100&q=80',
      'https://images.unsplash.com/photo-1529778873920-4da4926a72c2?auto=format&fit=crop&w=800&q=80',
    ].join('|'),
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
    good_with_dogs: 'UNKNOWN',
    good_with_cats: 'YES',
    breed: 'Домашняя короткошёрстная',
    house_trained: true,
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
    good_with_dogs: 'YES',
    good_with_cats: 'YES',
    breed: 'Метис',
    house_trained: false,
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
    // Несколько фото через «|» — так же, как в ячейке Google Таблицы
    photo_url: [
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=800&h=1100&q=80',
    ].join('|'),
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
    good_with_dogs: 'UNKNOWN',
    good_with_cats: 'YES',
    breed: 'Домашний длинношёрстный',
    house_trained: true,
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
    good_with_dogs: 'YES',
    good_with_cats: 'YES',
    breed: 'Метис той-терьера',
    house_trained: true,
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
    // Несколько фото через «|» — так же, как в ячейке Google Таблицы
    photo_url: [
      'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?auto=format&fit=crop&w=800&h=1100&q=80',
      'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=800&q=80',
    ].join('|'),
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
    good_with_kids: 'UNKNOWN',
    good_with_animals: false,
    good_with_dogs: 'UNKNOWN',
    good_with_cats: 'NO',
    breed: 'Домашняя короткошёрстная',
    house_trained: true,
    apartment_friendly: true,
    beginner_friendly: false,
    fundraising_goal_kzt: 40000,
    fundraising_collected_kzt: 27800,
    fundraising_purpose: 'реабилитацию лапы и корм',
    donation_usage: 'Корм, вакцинация щенков и аренда вольеров',
    created_at: '2026-11-11',
  },
  {
    id: 'pet-007',
    status: 'available',
    name: 'Рекс',
    species: 'dog',
    sex: 'male',
    age_months: 18,
    size: 'medium',
    photo_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80',
    description:
      'Рекс — молодой и дружелюбный пёс, которого подобрали щенком у рынка. Быстро учится, обожает играть в мяч и ладит с детьми.',
    character_tags: 'Игривый|Ладит с детьми|Привит',
    shelter_name: 'Zverohelp',
    shelter_verified: true,
    shelter_instagram: 'https://instagram.com/',
    reports_url: 'https://instagram.com/',
    curator_name: 'Куратор',
    curator_phone: '+7 700 000 00 00',
    curator_whatsapp: '77000000000',
    kaspi_phone: '+7 700 000 00 00',
    kaspi_link: 'https://kaspi.kz/',
    chip_number: '398000000000007',
    is_registered: true,
    is_vaccinated: true,
    is_sterilized: false,
    is_parasite_treated: true,
    good_with_kids: true,
    good_with_animals: true,
    good_with_dogs: 'YES',
    good_with_cats: 'UNKNOWN',
    breed: 'Метис',
    house_trained: true,
    apartment_friendly: true,
    beginner_friendly: true,
    fundraising_goal_kzt: 45000,
    fundraising_collected_kzt: 12000,
    fundraising_purpose: 'стерилизацию и корм',
    donation_usage: 'Корм, лечение и содержание животных',
    created_at: '2026-11-15',
  },
  {
    id: 'pet-008',
    status: 'available',
    name: 'Ласка',
    species: 'cat',
    sex: 'female',
    age_months: 8,
    size: 'small',
    photo_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
    description:
      'Ласка — нежная кошечка, которая любит сидеть на руках и мурчать. Приучена к лотку, здорова и готова к переезду.',
    character_tags: 'Ласковая|Приучена к лотку|Мурлыка',
    shelter_name: 'Я Живой',
    shelter_verified: true,
    shelter_instagram: 'https://instagram.com/',
    reports_url: 'https://instagram.com/',
    curator_name: 'Куратор',
    curator_phone: '+7 700 000 00 00',
    curator_whatsapp: '77000000000',
    kaspi_phone: '+7 700 000 00 00',
    kaspi_link: 'https://kaspi.kz/',
    chip_number: '398000000000008',
    is_registered: true,
    is_vaccinated: true,
    is_sterilized: true,
    is_parasite_treated: true,
    good_with_kids: true,
    good_with_animals: true,
    good_with_dogs: 'UNKNOWN',
    good_with_cats: 'YES',
    breed: 'Домашняя короткошёрстная',
    house_trained: true,
    apartment_friendly: true,
    beginner_friendly: true,
    fundraising_goal_kzt: 0,
    fundraising_collected_kzt: 0,
    fundraising_purpose: '',
    donation_usage: 'Корм, лечение и содержание животных',
    created_at: '2026-11-10',
  },
  {
    id: 'pet-009',
    status: 'available',
    name: 'Джек',
    species: 'dog',
    sex: 'male',
    age_months: 48,
    size: 'large',
    photo_url: 'https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?auto=format&fit=crop&w=800&q=80',
    description:
      'Джек — крупный охранник с добрым сердцем. Отлично подойдёт для частного дома. Знает основные команды, ладит с хозяином с полуслова.',
    character_tags: 'Охранник|Знает команды|Для двора',
    shelter_name: 'Ковчег Астана',
    shelter_verified: true,
    shelter_instagram: 'https://instagram.com/',
    reports_url: 'https://instagram.com/',
    curator_name: 'Куратор',
    curator_phone: '+7 700 000 00 00',
    curator_whatsapp: '77000000000',
    kaspi_phone: '+7 700 000 00 00',
    kaspi_link: 'https://kaspi.kz/',
    chip_number: '398000000000009',
    is_registered: true,
    is_vaccinated: true,
    is_sterilized: true,
    is_parasite_treated: true,
    good_with_kids: false,
    good_with_animals: false,
    good_with_dogs: 'NO',
    good_with_cats: 'NO',
    breed: 'Метис алабая',
    house_trained: true,
    apartment_friendly: false,
    beginner_friendly: false,
    fundraising_goal_kzt: 80000,
    fundraising_collected_kzt: 55000,
    fundraising_purpose: 'лечение лапы',
    donation_usage: 'Корм, лечение и содержание животных',
    created_at: '2026-10-20',
  },
  {
    id: 'pet-010',
    status: 'available',
    name: 'Соня',
    species: 'cat',
    sex: 'female',
    age_months: 24,
    size: 'medium',
    photo_url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=800&q=80',
    description:
      'Соня — спокойная трёхцветная кошка, которая любит понаблюдать за птицами в окне. Идеальна для тихого дома.',
    character_tags: 'Спокойная|Независимая|Любит уют',
    shelter_name: 'Zverohelp',
    shelter_verified: true,
    shelter_instagram: 'https://instagram.com/',
    reports_url: 'https://instagram.com/',
    curator_name: 'Куратор',
    curator_phone: '+7 700 000 00 00',
    curator_whatsapp: '77000000000',
    kaspi_phone: '+7 700 000 00 00',
    kaspi_link: 'https://kaspi.kz/',
    chip_number: '398000000000010',
    is_registered: true,
    is_vaccinated: true,
    is_sterilized: true,
    is_parasite_treated: true,
    good_with_kids: true,
    good_with_animals: 'UNKNOWN',
    good_with_dogs: 'UNKNOWN',
    good_with_cats: 'YES',
    breed: 'Домашняя короткошёрстная',
    house_trained: true,
    apartment_friendly: true,
    beginner_friendly: true,
    fundraising_goal_kzt: 0,
    fundraising_collected_kzt: 0,
    fundraising_purpose: '',
    donation_usage: 'Корм, лечение и содержание животных',
    created_at: '2026-09-30',
  },
  {
    id: 'pet-011',
    status: 'available',
    name: 'Арчи',
    species: 'dog',
    sex: 'male',
    age_months: 6,
    size: 'small',
    photo_url: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=800&q=80',
    description:
      'Арчи — весёлый щенок-непоседа. Вырастет до среднего размера. Любит всех вокруг и с радостью бежит знакомиться.',
    character_tags: 'Щенок|Дружелюбный|Активный',
    shelter_name: 'Я Живой',
    shelter_verified: true,
    shelter_instagram: 'https://instagram.com/',
    reports_url: 'https://instagram.com/',
    curator_name: 'Куратор',
    curator_phone: '+7 700 000 00 00',
    curator_whatsapp: '77000000000',
    kaspi_phone: '+7 700 000 00 00',
    kaspi_link: 'https://kaspi.kz/',
    chip_number: '',
    is_registered: false,
    is_vaccinated: false,
    is_sterilized: false,
    is_parasite_treated: true,
    good_with_kids: true,
    good_with_animals: true,
    good_with_dogs: 'YES',
    good_with_cats: 'YES',
    breed: 'Метис',
    house_trained: false,
    apartment_friendly: true,
    beginner_friendly: true,
    fundraising_goal_kzt: 30000,
    fundraising_collected_kzt: 8000,
    fundraising_purpose: 'прививки и чипирование',
    donation_usage: 'Корм, лечение и содержание животных',
    created_at: '2026-11-18',
  },
  {
    id: 'pet-012',
    status: 'available',
    name: 'Муха',
    species: 'cat',
    sex: 'female',
    age_months: 12,
    size: 'small',
    photo_url: 'https://images.unsplash.com/photo-1561948955-570b270e7c36?auto=format&fit=crop&w=800&q=80',
    description:
      'Муха — шустрая чёрная кошечка с характером. Любит играть и охотиться за игрушками. Подойдёт активной семье.',
    character_tags: 'Игривая|Шустрая|Охотница',
    shelter_name: 'Ковчег Астана',
    shelter_verified: true,
    shelter_instagram: 'https://instagram.com/',
    reports_url: 'https://instagram.com/',
    curator_name: 'Куратор',
    curator_phone: '+7 700 000 00 00',
    curator_whatsapp: '77000000000',
    kaspi_phone: '+7 700 000 00 00',
    kaspi_link: 'https://kaspi.kz/',
    chip_number: '398000000000012',
    is_registered: true,
    is_vaccinated: true,
    is_sterilized: false,
    is_parasite_treated: true,
    good_with_kids: true,
    good_with_animals: true,
    good_with_dogs: 'UNKNOWN',
    good_with_cats: 'YES',
    breed: 'Домашняя короткошёрстная',
    house_trained: true,
    apartment_friendly: true,
    beginner_friendly: true,
    fundraising_goal_kzt: 25000,
    fundraising_collected_kzt: 20000,
    fundraising_purpose: 'стерилизацию',
    donation_usage: 'Корм, лечение и содержание животных',
    created_at: '2026-11-01',
  },
  {
    id: 'pet-013',
    status: 'available',
    name: 'Байкал',
    species: 'dog',
    sex: 'male',
    age_months: 30,
    size: 'large',
    photo_url: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=800&q=80',
    description:
      'Байкал — статный и умный пёс с густой шерстью. Спокойный, преданный, хорошо переносит холод. Мечтает о своём дворе.',
    character_tags: 'Преданный|Спокойный|Для двора',
    shelter_name: 'Zverohelp',
    shelter_verified: true,
    shelter_instagram: 'https://instagram.com/',
    reports_url: 'https://instagram.com/',
    curator_name: 'Куратор',
    curator_phone: '+7 700 000 00 00',
    curator_whatsapp: '77000000000',
    kaspi_phone: '+7 700 000 00 00',
    kaspi_link: 'https://kaspi.kz/',
    chip_number: '398000000000013',
    is_registered: true,
    is_vaccinated: true,
    is_sterilized: true,
    is_parasite_treated: true,
    good_with_kids: true,
    good_with_animals: false,
    good_with_dogs: 'UNKNOWN',
    good_with_cats: 'NO',
    breed: 'Метис хаски',
    house_trained: true,
    apartment_friendly: false,
    beginner_friendly: false,
    fundraising_goal_kzt: 0,
    fundraising_collected_kzt: 0,
    fundraising_purpose: '',
    donation_usage: 'Корм, лечение и содержание животных',
    created_at: '2026-10-05',
  },
  {
    id: 'pet-014',
    status: 'available',
    name: 'Тиша',
    species: 'cat',
    sex: 'male',
    age_months: 36,
    size: 'medium',
    photo_url: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=800&q=80',
    description:
      'Тиша — солидный рыжий кот, который уже всё повидал и теперь хочет только тёплый плед и заботу. Самостоятельный и чистоплотный.',
    character_tags: 'Самостоятельный|Чистоплотный|Солидный',
    shelter_name: 'Я Живой',
    shelter_verified: true,
    shelter_instagram: 'https://instagram.com/',
    reports_url: 'https://instagram.com/',
    curator_name: 'Куратор',
    curator_phone: '+7 700 000 00 00',
    curator_whatsapp: '77000000000',
    kaspi_phone: '+7 700 000 00 00',
    kaspi_link: 'https://kaspi.kz/',
    chip_number: '398000000000014',
    is_registered: true,
    is_vaccinated: true,
    is_sterilized: true,
    is_parasite_treated: true,
    good_with_kids: true,
    good_with_animals: true,
    good_with_dogs: 'UNKNOWN',
    good_with_cats: 'YES',
    breed: 'Домашняя короткошёрстная',
    house_trained: true,
    apartment_friendly: true,
    beginner_friendly: true,
    fundraising_goal_kzt: 0,
    fundraising_collected_kzt: 0,
    fundraising_purpose: '',
    donation_usage: 'Корм, лечение и содержание животных',
    created_at: '2026-09-20',
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
 * Безопасность данных на живом сайте:
 *   • успешные загрузки обоих листов кэшируются в localStorage;
 *   • если таблица недоступна — берём последний сохранённый реальный кэш;
 *   • нет и кэша — показываем блок ошибки с кнопкой «Обновить страницу»;
 *   • в таблице 0 активных животных — дружелюбная заглушка, без подмены данных;
 *   • тестовые MOCK_PETS подставляются ТОЛЬКО на localhost / 127.0.0.1 / в превью Claude,
 *     когда таблица заблокирована (и как декоративные фото в коллаже первого экрана).
 * ===================================================================== */

// Адрес таблицы и порядок источников (opensheet → Google напрямую) — в src/sheetSource.js

// Поля, которые всегда берутся из листа приютов (если там заполнены)
const SHELTER_OWNED_FIELDS = ['shelter_verified', 'shelter_instagram', 'reports_url', 'kaspi_phone', 'kaspi_link', 'donation_usage'];
// Поля куратора: сначала из строки питомца, при пустом значении — из приюта
const CURATOR_FIELDS = ['curator_name', 'curator_phone', 'curator_whatsapp'];

// Номер для wa.me: только цифры, казахстанские 8XXXXXXXXXX → 7XXXXXXXXXX («+7 (700) 000-01-41» → 77000000141)
function whatsappNumber(value) {
  const d = String(value ?? '').replace(/\D/g, '');
  return d.length === 11 && d.startsWith('8') ? `7${d.slice(1)}` : d;
}

const cleanText = (v) => (v === undefined || v === null ? '' : String(v).trim());
const isFilled = (v) => cleanText(v) !== '';
const shelterKey = (name) => cleanText(name);


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

// Локальная разработка или превью Claude — только здесь допустимы тестовые данные
function isDevOrPreview() {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host.includes('claude');
}

const CACHE_KEYS = { pets: 'astanapets_cache_pets', shelters: 'astanapets_cache_shelters' };

function saveCache(key, rows) {
  try {
    window.localStorage.setItem(key, JSON.stringify({ savedAt: new Date().toISOString(), rows }));
  } catch (_) {
    /* хранилище недоступно или переполнено — просто не кэшируем */
  }
}

// { rows, savedAt } или null
function readCache(key) {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || 'null');
    return parsed && Array.isArray(parsed.rows) ? { rows: parsed.rows, savedAt: parsed.savedAt || '' } : null;
  } catch (_) {
    return null;
  }
}

// Снимок каталога, который кладётся в сайт при каждой сборке (scripts/snapshot-catalog.mjs)
async function readSnapshot() {
  try {
    const response = await fetch('/data/catalog.json', { cache: 'no-cache' });
    if (!response.ok) return null;
    const data = await response.json();
    return Array.isArray(data?.pets) && data.pets.length > 0 ? data : null;
  } catch (_) {
    return null;
  }
}

/**
 * Загружает оба листа параллельно и склеивает их.
 * Возвращает { pets, shelters, source, status }:
 *   pets     — строки питомцев (ещё без normalizePet)
 *   shelters — строки приютов или null (тогда приюты соберутся из строк питомцев)
 *   source   — 'sheet' | 'cache' | 'snapshot' | 'mock'
 *   via      — откуда пришла таблица: 'opensheet' | 'google' (только для source = 'sheet')
 *   status   — 'ok' | 'empty' (таблица загрузилась, но активных нет) | 'error' (нет ни данных, ни кэша)
 */
async function fetchData() {
  if (DEMO_BUILD) return { pets: MOCK_PETS, shelters: null, source: 'mock', via: null, status: 'ok' };
  const [petsSheet, sheltersSheet] = await Promise.all([loadSheet('pets'), loadSheet('shelters')]);
  const freshPets = petsSheet?.rows || null;
  const freshShelters = sheltersSheet?.rows || null;

  // Каждую успешную загрузку сохраняем как «последние реальные данные»
  if (freshPets) saveCache(CACHE_KEYS.pets, freshPets);
  if (freshShelters) saveCache(CACHE_KEYS.shelters, freshShelters);

  let petRows = freshPets;
  let shelterRows = freshShelters;
  let source = 'sheet';

  // Таблица недоступна совсем: берём то, что свежее, — кэш этого браузера или снимок из сборки сайта
  if (!petRows) {
    const cachedPets = readCache(CACHE_KEYS.pets);
    const cachedShelters = readCache(CACHE_KEYS.shelters);
    const snapshot = await readSnapshot();
    const cacheIsNewer = cachedPets && (!snapshot || String(cachedPets.savedAt) >= String(snapshot.savedAt));
    if (cacheIsNewer) {
      petRows = cachedPets.rows;
      shelterRows = shelterRows || cachedShelters?.rows || null;
      source = 'cache';
    } else if (snapshot) {
      petRows = snapshot.pets;
      shelterRows = shelterRows || snapshot.shelters || null;
      source = 'snapshot';
    }
  } else if (!shelterRows) {
    shelterRows = readCache(CACHE_KEYS.shelters)?.rows || null;
  }

  if (!petRows) {
    if (isDevOrPreview()) {
      console.warn('Таблица недоступна (локальная разработка / превью) — показываем тестовые MOCK_PETS.');
      return { pets: MOCK_PETS, shelters: null, source: 'mock', via: null, status: 'ok' };
    }
    console.error('Таблица недоступна, а сохранённых данных нет — показываем сообщение об ошибке.');
    return { pets: [], shelters: null, source: 'none', via: null, status: 'error' };
  }
  if (source !== 'sheet') console.warn(`Таблица недоступна — показываем сохранённые данные (${source === 'cache' ? 'кэш браузера' : 'снимок из сборки'}).`);

  // Активные записи: есть кличка и статус available (регистр и пробелы по краям не важны).
  // Пустые строки, строки с выпадающими списками и пристроенные (adopted) отбрасываются.
  const activePets = petRows
    .filter((row) => isFilled(row.name) && cleanText(row.status).toLowerCase() === 'available')
    .map((row) => ({ ...row, status: 'available' }));

  const shelters = (shelterRows || [])
    .filter((row) => isFilled(row.shelter_name))
    .map((row) => ({ ...row, shelter_name: cleanText(row.shelter_name) }));
  const sheltersByName = new Map(shelters.map((sh) => [shelterKey(sh.shelter_name), sh]));

  return {
    pets: activePets.map((pet) => mergePetWithShelter(pet, sheltersByName)),
    shelters: shelters.length > 0 ? shelters : null,
    source,
    via: source === 'sheet' ? petsSheet.via : null,
    status: activePets.length > 0 ? 'ok' : 'empty',
  };
}

// Строка приюта из таблицы → нужные типы
function normalizeShelter(row) {
  const bool = (v) => v === true || v === 'TRUE' || v === 'true' || v === '1' || v === 1;
  // Явное «FALSE/нет» в shelter_verified прячет приют целиком; пустая ячейка — не прячет (просто нет значка «Проверен»)
  const verifiedRaw = cleanText(row.shelter_verified).toLowerCase();
  return {
    shelter_name: cleanText(row.shelter_name),
    shelter_verified: bool(row.shelter_verified),
    shelter_hidden: ['false', '0', 'нет', 'no', 'off'].includes(verifiedRaw),
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
// Ссылки Google Диска вида «/file/d/ID/view» или «open?id=ID» ведут на страницу, а не на картинку.
// Превращаем их в прямую ссылку на изображение (файл должен быть открыт «всем, у кого есть ссылка»).
function normalizePhotoUrl(url) {
  const u = String(url ?? '').trim();
  const drive = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{10,})/);
  if (drive) return `https://drive.google.com/thumbnail?id=${drive[1]}&sz=w1600`;
  return u;
}

// photo_url → массив ссылок. Разделители: «|», перенос строки или запятая с пробелом
function parsePhotos(value) {
  const list = Array.isArray(value) ? value : String(value ?? '').split(/\s*\|\s*|\r?\n|,\s+/);
  const photos = list.map(normalizePhotoUrl).filter(Boolean);
  return photos.length > 0 ? photos : [FALLBACK_PHOTO];
}

// Совместимость: YES / NO / UNKNOWN (а также TRUE / FALSE, да / нет) → 'yes' | 'no' | 'unknown'
function toTriState(v) {
  if (v === true || v === 1) return 'yes';
  if (v === false || v === 0) return 'no';
  const t = String(v ?? '').trim().toLowerCase();
  if (['yes', 'true', '1', 'да'].includes(t)) return 'yes';
  if (['no', 'false', '0', 'нет'].includes(t)) return 'no';
  return 'unknown';
}

// Размер из таблицы: понимаем синонимы (big, крупный, L…), а не только small/medium/large
const SIZE_ALIASES = {
  small: ['small', 's', 'mini', 'little', 'tiny', 'маленький', 'маленькая', 'мелкий', 'мелкая', 'мини'],
  medium: ['medium', 'm', 'mid', 'middle', 'average', 'средний', 'средняя'],
  large: ['large', 'l', 'big', 'xl', 'huge', 'крупный', 'крупная', 'большой', 'большая'],
};

function normalizeSize(value) {
  const v = String(value ?? '').trim().toLowerCase();
  return Object.keys(SIZE_ALIASES).find((k) => SIZE_ALIASES[k].includes(v)) || '';
}

function normalizePet(row) {
  const bool = (v) => v === true || v === 'TRUE' || v === 'true' || v === '1' || v === 1;
  const num = (v) => Number(String(v ?? '0').replace(/\s/g, '')) || 0;
  const compatKids = toTriState(row.good_with_kids);
  const compatAnimals = toTriState(row.good_with_animals);
  const photos = parsePhotos(row.photos || row.photo_url);
  return {
    ...row,
    photos,
    photo_url: photos[0], // обложка для каталога, коллажа и слайдера
    age_months: num(row.age_months),
    size: normalizeSize(row.size),
    shelter_verified: bool(row.shelter_verified),
    is_registered: bool(row.is_registered),
    is_vaccinated: bool(row.is_vaccinated),
    is_sterilized: bool(row.is_sterilized),
    is_parasite_treated: bool(row.is_parasite_treated),
    // Булевы флаги остаются для фильтров: true только при явном «да»
    good_with_kids: compatKids === 'yes',
    good_with_animals: compatAnimals === 'yes',
    // Три состояния — для блока «Совместимость» в карточке
    compat_kids: compatKids,
    compat_dogs: toTriState(row.good_with_dogs),
    compat_cats: toTriState(row.good_with_cats),
    compat_animals: compatAnimals,
    breed: String(row.breed ?? '').trim() || 'Домашний любимец / Метис',
    house_trained: bool(row.house_trained),
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
  if (!months || months <= 0) return 'Возраст уточняется';
  if (months < 12) return `${months} ${pluralRu(months, ['месяц', 'месяца', 'месяцев'])}`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const y = `${years} ${pluralRu(years, ['год', 'года', 'лет'])}`;
  return rest ? `${y} ${rest} мес.` : y;
}

/**
 * Умное кадрирование для обложки карточки (формат 4:3).
 * Cloudinary (обычно res.cloudinary.com/<облако>/image/upload/...): если после /upload/ ещё нет
 * трансформаций, вставляем c_fill,g_auto,ar_4:3,q_auto,f_auto — облако само находит морду
 * животного и кадрирует кадр. Остальные ссылки возвращаются без изменений.
 */
const CLOUDINARY_SMART_CROP = 'c_fill,g_auto,ar_4:3,q_auto,f_auto';

function getSmartPhotoUrl(url) {
  const u = String(url ?? '');
  if (!/^https?:\/\/([\w-]+\.)*cloudinary\.com\//i.test(u) || !u.includes('/upload/')) return u;
  const [before, after] = u.split(/\/upload\/(.*)/s);
  const firstSegment = (after || '').split('/')[0];
  // Уже есть трансформации (c_..., w_..., g_..., f_... и т. п.) — ничего не трогаем
  const hasTransforms = /^[a-z]{1,3}_[^/.]*$/i.test(firstSegment); // без точки — значит, это не имя файла вроде my_dog.jpg
  if (hasTransforms) return u;
  return `${before}/upload/${CLOUDINARY_SMART_CROP}/${after}`;
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

/* ---------- Умный поиск ----------
 * Для каждого питомца собирается виртуальная строка: кличка, порода, описание, приют, теги
 * + русские синонимы служебных полей. Запрос разбивается на слова; питомец подходит,
 * если в его строке есть КАЖДОЕ слово («спокойная кошка», «мальчик щенок»). Ё = Е.
 * Окончания не мешают: «спокойная» найдёт тег «Спокойный», «привита» — «привит».
 * Слова ищутся с начала слова, а не в середине («кот» не находит «который»).
 * Слова о виде и поле («кошка», «пёс», «мальчик», «девочка») работают как точный фильтр,
 * поэтому «кошка» не найдёт собаку, у которой в описании «ладит с кошками».
 * «щенок / котёнок» — только для малышей до 1 года.
 */
const SPECIES_WORDS = {
  dog: ['собака', 'собаки', 'собачка', 'пес', 'псы', 'песик', 'щенок', 'щенки', 'щенка'],
  cat: ['кошка', 'кошки', 'кошечка', 'кот', 'коты', 'котик', 'котенок', 'котята', 'котенка'],
};
const SEX_WORDS = {
  male: ['мальчик', 'мальчика', 'кобель', 'парень'],
  female: ['девочка', 'девочку', 'сука'],
};
const BABY_WORDS = ['щенок', 'щенки', 'щенка', 'котенок', 'котята', 'котенка'];
const keyOf = (map, word) => Object.keys(map).find((k) => map[k].includes(word));
const normalizeSearch = (text) => String(text ?? '').toLowerCase().replace(/ё/g, 'е');

function buildSearchIndex(p) {
  const parts = [p.name, p.breed, p.description, p.shelter_name, String(p.character_tags ?? '').replace(/\|/g, ' ')];
  const isBaby = p.age_months > 0 && p.age_months < 12;
  if (p.species === 'dog') parts.push(`собака пес пёс${isBaby ? ' щенок' : ''}`);
  if (p.species === 'cat') parts.push(`кошка кот${isBaby ? ' котёнок котенок' : ''}`);
  if (p.sex === 'male') parts.push(p.species === 'dog' ? 'мальчик кобель парень' : 'мальчик парень');
  if (p.sex === 'female') parts.push(p.species === 'dog' ? 'девочка сука' : 'девочка');
  if (p.size === 'small') parts.push('маленький миниатюрный');
  if (p.size === 'medium') parts.push('средний');
  if (p.size === 'large') parts.push('крупный большой');
  if (p.is_sterilized) parts.push('стерилизован стерилизована кастрирован');
  if (p.is_vaccinated) parts.push('привит привита вакцинирован');
  if (p.apartment_friendly) parts.push('квартира для квартиры');
  if (p.good_with_kids === true || p.compat_kids === 'yes') parts.push('дети с детьми');
  return normalizeSearch(parts.filter(Boolean).join(' '))
    .split(/[^a-zа-я0-9]+/)
    .filter(Boolean);
}

// Слово найдено, если с него (или с его основы без 1–2 букв окончания) начинается какое-то слово питомца.
// Короткие слова (до 3 букв) должны совпасть целиком.
function searchWordMatches(tokens, word) {
  if (word.length <= 3) return tokens.includes(word);
  const stems = [word];
  if (word.length >= 6) stems.push(word.slice(0, -2));
  if (word.length >= 5) stems.push(word.slice(0, -1));
  return tokens.some((t) => stems.some((st) => t.startsWith(st)));
}

// Питомец подходит под поисковый запрос
function matchesSearch(p, words) {
  const rest = [];
  for (const w of words) {
    const species = keyOf(SPECIES_WORDS, w);
    const sex = keyOf(SEX_WORDS, w);
    if (species) {
      if (p.species !== species) return false;
      if (BABY_WORDS.includes(w) && !(p.age_months > 0 && p.age_months < 12)) return false;
    } else if (sex) {
      if (p.sex !== sex) return false;
    } else {
      rest.push(w);
    }
  }
  if (rest.length === 0) return true;
  const tokens = buildSearchIndex(p);
  return rest.every((w) => searchWordMatches(tokens, w));
}

function applyFilters(pets, f) {
  const words = normalizeSearch(f.query.trim()).split(/\s+/).filter(Boolean);
  return pets.filter((p) => {
    if (p.status && p.status !== 'available') return false;
    if (words.length > 0 && !matchesSearch(p, words)) return false;
    if (f.species !== 'all' && p.species !== f.species) return false;
    if (f.sex !== 'all' && p.sex !== f.sex) return false;
    if (f.age !== 'all' && !(p.age_months > 0)) return false; // возраст не указан — не попадает в возрастные фильтры
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
 * Палитра Coolors из 5 цветов + шрифт Rubik.
 * Все фирменные цвета заданы семантическими CSS-классами с префиксом .ap-
 * (см. GLOBAL_CSS), без произвольных классов Tailwind в квадратных скобках.
 *   #F3F1ED — шапка и первый экран, #EAE6DF — каталог, карточки и окна #FDFCFB
 *   Текст: zinc-900 #18181B (заголовки, значения), zinc-700 #3F3F46 (описания)
 *   #606C38 — оливково-мшистый (главные действия, активные фильтры)
 *   #283618 — глубокий хвойный (текст, блок «Помочь приютам», карточки #344620)
 *   #DDA15E — медовый песок (сборы, «Ищет семью», проверка)
 *   #BC6C25 — тёплая карамель («Помочь приюту», сердечки, счётчики фильтров)
 * ===================================================================== */

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700;800&display=swap');

/* ---------- Каркас и шрифт ----------
   Один шрифт на всё: в Rubik есть кириллица, латиница, цифры и знак ₸, поэтому
   цифры, «Kaspi» и «AstanaPets» выглядят так же, как русский текст рядом. */
.ap-root, .ap-root button, .ap-root input, .ap-root a, .ap-root label {
  font-family: 'Rubik', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
}
.ap-root { background-color: #F3F1ED; color: #18181B; -webkit-font-smoothing: antialiased; }
/* Воздушный основной текст; :where() не перебивает явные классы leading-* */
:where(.ap-root) p, :where(.ap-root) li, :where(.ap-root) blockquote { line-height: 1.65; }

/* Защита от горизонтального скролла на телефонах.
   overflow-x: clip режет лишнее так же, как hidden, но не ломает «липкую» шапку (position: sticky).
   max-width: 100%, а не 100vw: на компьютере 100vw включает ширину полосы прокрутки и сам даёт сдвиг. */
html, body, #root { max-width: 100%; overflow-x: hidden; }
.ap-clip-x { overflow-x: hidden; }
@supports (overflow-x: clip) {
  html, body, #root { overflow-x: clip; }
  .ap-clip-x { overflow-x: clip; }
}

/* ---------- Цветовые блоки секций ---------- */
.ap-cream-block { background-color: #F3F1ED; }        /* шапка и первый экран — светлый тёпло-серый */
.ap-catalog-block { background-color: #EAE6DF; }      /* каталог — нейтральный песочный без желтизны */
.ap-forest-block { background-color: #283618; color: #FDFCFB; }  /* «Помочь приютам» — глубокий хвойный */
.ap-footer { background-color: #F3F1ED; }
.ap-demo-banner { background-color: #E36243; color: #FFFFFF; }
.ap-footer-paw { color: #E36243; opacity: 0.12; }

/* ---------- Текст ---------- */
.ap-text-main { color: #18181B; }          /* zinc-900: заголовки и значения */
.ap-text-strong { color: #27272A; }        /* zinc-800 */
.ap-text-muted { color: #3F3F46; }         /* zinc-700: описания */
.ap-text-soft { color: #52525B; }          /* zinc-600 */
.ap-text-faint { color: #71717A; }         /* zinc-500 */
.ap-ivory-text { color: #FDFCFB; }
.ap-fill-ivory { fill: #FDFCFB; }
.ap-text-accent { color: #A45B1C; }        /* карамель, чуть темнее для читаемости текста */
.ap-text-sage-deep { color: #606C38; }     /* оливково-мшистый */
.ap-text-sage { color: #DDA15E; }
.ap-link:hover { color: #18181B; }
.ap-prose { line-height: 1.8; }

/* Текст на хвойном блоке */
.ap-on-dark { color: #FDFCFB; }
.ap-on-dark-muted { color: #DCDDC3; }
.ap-on-dark-soft { color: #B9BC9C; }

/* ---------- Поверхности и линии ---------- */
.ap-surface { background-color: #F5F3EF; }     /* подложка внутри карточки */
.ap-sand { background-color: #F1EEE9; }
.ap-sand-deep { background-color: #E5E0D7; }
.ap-paper { background-color: #FDFCFB; }
.ap-modal-bg { background-color: #FDFCFB; }
.ap-header-glass { background-color: rgba(243, 241, 237, 0.92); }
.ap-glass { background-color: rgba(253, 252, 251, 0.94); }
.ap-overlay { background-color: rgba(40, 54, 24, 0.45); }
/* Нейтральные тёплые границы без желтизны */
.ap-line { border-color: #DFDAD2; }
.ap-line-soft { border-color: #E6E2DB; }
.ap-divide > * { border-color: #E9E5DF; }

.ap-shadow-soft { box-shadow: 0 2px 10px rgba(40, 54, 24, 0.08); }
.ap-card {
  background-color: #FDFCFB;
  border: 1px solid #DFDAD2;
  box-shadow: 0 4px 20px rgba(40, 54, 24, 0.05);
}
.ap-card-hover:hover {
  border-color: #C9C1B4;
  box-shadow: 0 10px 30px rgba(40, 54, 24, 0.09);
}

/* ---------- Главный акцент: оливково-мшистый #606C38 ---------- */
.ap-btn-accent { background-color: #606C38; color: #FDFCFB; box-shadow: 0 4px 14px rgba(96, 108, 56, 0.2); }
.ap-btn-accent:hover { background-color: #4F5A2D; }
.ap-btn-outline-accent { background-color: #EEF0DC; color: #4F5A2D; border-color: #606C38; }
.ap-chip-idle { background-color: #FDFCFB; color: #3F3F46; border-color: #D9D3C9; }
.ap-chip-idle:hover { background-color: #F3F1ED; border-color: #A8A090; color: #18181B; }
.ap-chip-active { background-color: #606C38; border-color: #606C38; color: #FDFCFB; box-shadow: 0 4px 14px rgba(96, 108, 56, 0.2); }
.ap-tab-idle { color: #3F3F46; }
.ap-tab-on { color: #FDFCFB; }
.ap-tab-slider { width: calc((100% - 0.75rem - 0.75rem) / 3); transition: transform 0.45s cubic-bezier(0.34, 1.3, 0.64, 1); }
.ap-tab-idle:hover { background-color: #FDFCFB; color: #18181B; }

/* ---------- Медовый песок #DDA15E и тёплая карамель #BC6C25 ---------- */
.ap-badge-honey { background-color: #DDA15E; color: #283618; }   /* «Ищет семью», «Проверен» */
.ap-btn-caramel { background-color: #BC6C25; color: #FDFCFB; box-shadow: 0 4px 14px rgba(188, 108, 37, 0.25); }
.ap-btn-caramel:hover { background-color: #A45B1C; }
.ap-btn-accent-soft { background-color: #FBF1DF; color: #9A541A; border-color: rgba(221, 161, 94, 0.5); }
.ap-btn-accent-soft:hover { background-color: #F6E4C6; border-color: #BC6C25; }
.ap-accent-soft { background-color: #FBEBD3; }
.ap-hover-accent-soft:hover { background-color: #FBEBD3; }
.ap-heart-on { color: #BC6C25; fill: #BC6C25; }
.ap-progress-fill { background-color: #DDA15E; }

/* ---------- Статусы ---------- */
/* .ap-sage — бейджи проверки («Проверен», «Спасён в Астане») в медовом цвете */
.ap-sage { background-color: #DDA15E; color: #283618; }
.ap-sage-fill { background-color: #606C38; }
.ap-sage-text { color: #4F5A2D; }   /* числа-акценты под цвет зелёной точки */
.ap-sage-soft { background-color: #EEF0DC; }
.ap-sage-panel { background-color: #F3F4E3; border-color: #CDD3AE; }
.ap-toggle-idle { background-color: #FDFCFB; color: #3F3F46; border-color: #D9D3C9; }
.ap-toggle-idle:hover { background-color: #F3F1ED; border-color: #A8A090; }
.ap-toggle-active { background-color: #606C38; border-color: #606C38; color: #FDFCFB; box-shadow: 0 4px 14px rgba(96, 108, 56, 0.2); }
.ap-track-off { background-color: #DDD8CF; }
.ap-track-on { background-color: #8A9659; }
.ap-knob { background-color: #FDFCFB; box-shadow: 0 1px 2px rgba(40, 54, 24, 0.25); }

/* ---------- Тёмные элементы, поля ввода, внешние сервисы ---------- */
.ap-bg-graphite { background-color: #27272A; color: #FDFCFB; }
.ap-bg-graphite:hover { background-color: #3F3F46; }
.ap-input { background-color: #F7F5F1; border-color: #D9D3C9; color: #18181B; }
.ap-input:focus { border-color: #606C38; background-color: #FDFCFB; box-shadow: 0 0 0 4px rgba(96, 108, 56, 0.14); }
.ap-field { background-color: #F7F5F1; border-color: #D9D3C9; color: #18181B; }
.ap-btn-whatsapp { background-color: #25A55F; color: #FDFCFB; }
.ap-btn-whatsapp:hover { background-color: #1E8D50; }
.ap-btn-kaspi { background-color: #E5402F; color: #FDFCFB; }
.ap-btn-kaspi:hover { background-color: #C93424; }
.ap-btn-telegram { background-color: #229ED9; color: #FFFFFF; box-shadow: 0 4px 14px rgba(34, 158, 217, 0.25); }
.ap-btn-telegram:hover { background-color: #1B87BA; }

/* ---------- Хвойная секция «Помочь приютам» ---------- */
.ap-shelter-card { background-color: #344620; border: 1px solid rgba(221, 161, 94, 0.22); }
.ap-shelter-card:hover { border-color: rgba(221, 161, 94, 0.5); background-color: #3A4D24; }
.ap-pill-on-dark { background-color: rgba(221, 161, 94, 0.18); color: #F0C48F; }

/* ---------- Теги характера (character_tags): 2 строгие категории ---------- */
.ap-tag-trait { background-color: #EEF0DC; color: #3F4A1F; }   /* Категория 1: черты характера — оливковый туман */
.ap-tag-skill { background-color: #FBEBD3; color: #8A4F17; }
.ap-tag-more { background-color: transparent; color: #71717A; box-shadow: inset 0 0 0 1px #D4D4D8; }   /* Категория 2: навыки и здоровье — мёд */

/* ---------- Фото ---------- */
.ap-photo { aspect-ratio: 4 / 3; }
.ap-portrait { aspect-ratio: 4 / 5; }
.ap-neg { color: #C85A32; }                            /* отрицательные статусы: тёплая терракота вместо красного */
.ap-neg-soft { background-color: rgba(249, 115, 22, 0.15); }  /* orange-500 / 15% */
.ap-badge-verified { background-color: #D1FAE5; color: #065F46; border-color: #A7F3D0; }   /* emerald-100 / 800 / 200 */
.ap-badge-shelter { background-color: #F3F1ED; color: #27272A; border-color: #E4E4E7; }
.ap-focus-face { object-position: 50% 22%; }  /* держим верх кадра с головой животного */
.ap-photo-count { background-color: rgba(24, 24, 27, 0.6); color: #FDFCFB; }
.ap-thumb-active { box-shadow: 0 0 0 2px #FDFCFB, 0 0 0 4px #606C38; opacity: 1; }
.ap-photo-fade {
  background: linear-gradient(to bottom, rgba(30, 34, 20, 0.45) 0%, rgba(30, 34, 20, 0.14) 45%, rgba(30, 34, 20, 0) 75%);
}
.ap-photo-fade-bottom {
  background: linear-gradient(to top, rgba(30, 34, 20, 0.72) 0%, rgba(30, 34, 20, 0.3) 45%, rgba(30, 34, 20, 0) 100%);
}

.ap-no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
.ap-no-scrollbar::-webkit-scrollbar { display: none; }

/* Плавное раскрытие панели «Расширенный поиск» */
.ap-collapse { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 0.35s ease, opacity 0.3s ease; }
.ap-collapse.is-open { grid-template-rows: 1fr; opacity: 1; }
.ap-collapse > div { min-height: 0; overflow: hidden; }

/* Модальные окна и боковая шторка */
.ap-drawer-panel { animation: ap-slide-left 0.32s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
.ap-backdrop { animation: ap-fade 0.25s ease both; }
.ap-modal-panel { max-height: 92vh; animation: ap-slide-up 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
/* Плавное закрытие (0.24 с — как CLOSE_MS в коде): затемнение гаснет, анкета уезжает вниз, шторка — вправо */
.ap-backdrop.is-closing { animation: ap-fade-out 0.24s ease both; }
.ap-modal-panel.is-closing { animation: ap-pop-out 0.24s cubic-bezier(0.4, 0, 1, 1) both; }
.ap-drawer-panel.is-closing { animation: ap-slide-right-out 0.24s cubic-bezier(0.4, 0, 1, 1) both; }
@media (max-width: 639px) { .ap-modal-panel.is-closing { animation-name: ap-sheet-down; } }
.ap-toast { animation: ap-slide-up 0.25s ease both; }

/* Микро-анимации */
.ap-pop { animation: ap-pop 0.45s cubic-bezier(0.2, 0.8, 0.2, 1); }
.ap-float { animation: ap-float 6s ease-in-out infinite; }
.ap-float-slow { animation: ap-float 7s ease-in-out 1.2s infinite; }
.ap-float-late { animation: ap-float 6.5s ease-in-out 2.4s infinite; }

@keyframes ap-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes ap-slide-left { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes ap-slide-up { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
@keyframes ap-fade-out { from { opacity: 1; } to { opacity: 0; } }
@keyframes ap-pop-out { from { opacity: 1; transform: translateY(0) scale(1); } to { opacity: 0; transform: translateY(24px) scale(0.97); } }
@keyframes ap-sheet-down { from { transform: translateY(0); } to { transform: translateY(100%); } }
@keyframes ap-slide-right-out { from { transform: translateX(0); } to { transform: translateX(100%); } }
@keyframes ap-pop { 0% { transform: scale(1); } 35% { transform: scale(1.35); } 60% { transform: scale(0.9); } 100% { transform: scale(1); } }
@keyframes ap-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

@media (prefers-reduced-motion: reduce) {
  .ap-tab-slider { transition: none; }
  .ap-backdrop, .ap-modal-panel, .ap-drawer-panel, .ap-toast, .ap-pop, .ap-float, .ap-float-slow, .ap-float-late { animation: none; }
  .ap-collapse { transition: none; }
}
/* =====================================================================
   ТЁМНАЯ ТЕМА — тёплая землисто-графитовая, без холодного синего и неона.
   Включается классом .ap-dark на корневом блоке.
   ===================================================================== */
.ap-root.ap-dark { background-color: #1A1917; color: #F5F3EF; color-scheme: dark; }
.ap-dark .ap-cream-block, .ap-dark .ap-footer { background-color: #1A1917; }
.ap-dark .ap-footer-paw { opacity: 0.14; }
.ap-dark .ap-catalog-block { background-color: #23221F; }
.ap-dark .ap-forest-block { background-color: #1F2A15; }
.ap-dark .ap-shelter-card { background-color: #2A3820; border-color: #3E4D2C; }
.ap-dark .ap-shelter-card:hover { background-color: #304026; border-color: #5A6B3E; }

.ap-dark .ap-text-main { color: #F5F3EF; }
.ap-dark .ap-text-strong { color: #E7E3DC; }
.ap-dark .ap-text-muted { color: #B5AFA6; }
.ap-dark .ap-text-soft { color: #A39D94; }
.ap-dark .ap-text-faint { color: #8A847B; }
.ap-dark .ap-text-accent { color: #EE8A70; }
.ap-dark .ap-text-sage-deep { color: #B3C27A; }
.ap-dark .ap-link:hover { color: #F5F3EF; }

.ap-dark .ap-surface { background-color: #33302C; }
.ap-dark .ap-sand { background-color: #34312D; }
.ap-dark .ap-sand-deep { background-color: #3A3732; }
.ap-dark .ap-paper { background-color: #2B2926; }
.ap-dark .ap-modal-bg { background-color: #1A1917; }
.ap-dark .ap-header-glass { background-color: rgba(26, 25, 23, 0.9); }
.ap-dark .ap-glass { background-color: rgba(43, 41, 38, 0.92); color: #E7E3DC; }
.ap-dark .ap-overlay { background-color: rgba(12, 11, 10, 0.6); }
.ap-dark .ap-line { border-color: #3E3B36; }
.ap-dark .ap-line-soft { border-color: #34312D; }
.ap-dark .ap-divide > * { border-color: #34312D; }
.ap-dark .ap-shadow-soft { box-shadow: 0 2px 10px rgba(12, 11, 10, 0.35); }
.ap-dark .ap-card { background-color: #2B2926; border-color: #3E3B36; box-shadow: 0 4px 20px rgba(12, 11, 10, 0.25); }
.ap-dark .ap-card-hover:hover { border-color: #5A554D; box-shadow: 0 10px 30px rgba(12, 11, 10, 0.35); }

/* Главные действия: фирменная олива, чуть светлее для читаемости на тёмном */
.ap-dark .ap-btn-accent, .ap-dark .ap-chip-active, .ap-dark .ap-toggle-active {
  background-color: #6F7D42; border-color: #6F7D42; color: #F5F3EF; box-shadow: 0 4px 14px rgba(12, 11, 10, 0.3);
}
.ap-dark .ap-btn-accent:hover { background-color: #606C38; }
.ap-dark .ap-btn-outline-accent { background-color: rgba(111, 125, 66, 0.2); color: #CBD69A; border-color: #6F7D42; }
.ap-dark .ap-chip-idle, .ap-dark .ap-toggle-idle { background-color: #2B2926; color: #D6D1C9; border-color: #45413B; }
.ap-dark .ap-chip-idle:hover, .ap-dark .ap-toggle-idle:hover { background-color: #34312D; border-color: #6A645A; color: #F5F3EF; }
.ap-dark .ap-tab-idle { color: #B5AFA6; }
.ap-dark .ap-tab-on { color: #F5F3EF; }
.ap-dark .ap-tab-idle:hover { background-color: #2B2926; color: #F5F3EF; }

/* Помощь и акценты: кораллово-терракотовый */
.ap-dark .ap-btn-caramel { background-color: #E36243; color: #FDFCFB; box-shadow: 0 4px 14px rgba(227, 98, 67, 0.25); }
.ap-dark .ap-btn-caramel:hover { background-color: #CC5233; }
.ap-dark .ap-btn-accent-soft { background-color: rgba(227, 98, 67, 0.14); color: #F09A80; border-color: rgba(227, 98, 67, 0.4); }
.ap-dark .ap-btn-accent-soft:hover { background-color: rgba(227, 98, 67, 0.24); border-color: #E36243; }
.ap-dark .ap-accent-soft, .ap-dark .ap-hover-accent-soft:hover { background-color: rgba(227, 98, 67, 0.16); }
.ap-dark .ap-heart-on { color: #E36243; fill: #E36243; }
.ap-dark .ap-sage, .ap-dark .ap-badge-honey { color: #1A1917; }

.ap-dark .ap-sage-fill { background-color: #8A9A52; }
.ap-dark .ap-sage-text { color: #B4C46E; }
.ap-dark .ap-sage-soft { background-color: rgba(111, 125, 66, 0.22); }
.ap-dark .ap-sage-panel { background-color: rgba(111, 125, 66, 0.14); border-color: rgba(111, 125, 66, 0.4); }
.ap-dark .ap-track-off { background-color: #45413B; }
.ap-dark .ap-track-on { background-color: #8A9A52; }
.ap-dark .ap-knob { background-color: #F5F3EF; }

.ap-dark .ap-bg-graphite { background-color: #F5F3EF; color: #1A1917; }
.ap-dark .ap-bg-graphite:hover { background-color: #E0DCD4; }
.ap-dark .ap-input, .ap-dark .ap-field { background-color: #23221F; border-color: #45413B; color: #F5F3EF; }
.ap-dark .ap-input:focus { border-color: #8A9A52; background-color: #2B2926; box-shadow: 0 0 0 4px rgba(138, 154, 82, 0.18); }

.ap-dark .ap-tag-trait { background-color: rgba(163, 179, 107, 0.18); color: #CBD69A; }
.ap-dark .ap-tag-skill { background-color: rgba(221, 161, 94, 0.18); color: #EBC08E; }
.ap-dark .ap-tag-more { color: #A8A29E; box-shadow: inset 0 0 0 1px #4A4640; }
.ap-dark .ap-neg { color: #E87A54; }
.ap-dark .ap-neg-soft { background-color: rgba(249, 115, 22, 0.18); }
.ap-dark .ap-badge-verified { background-color: rgba(2, 44, 34, 0.8); color: #6EE7B7; border-color: rgba(6, 95, 70, 0.6); }
.ap-dark .ap-badge-shelter { background-color: #2B2926; color: #E5E0D8; border-color: #3E3B36; }
.ap-dark .ap-thumb-active { box-shadow: 0 0 0 2px #1A1917, 0 0 0 4px #8A9A52; }

/* Стандартные классы Tailwind, которые встречаются в разметке */
.ap-dark .text-zinc-900 { color: #F5F3EF; }
.ap-dark .text-zinc-700 { color: #D6D1C9; }
.ap-dark .text-zinc-600 { color: #B5AFA6; }
.ap-dark .text-zinc-500 { color: #A39D94; }
.ap-dark .text-emerald-700 { color: #93CDA0; }
.ap-dark .text-emerald-600 { color: #86C494; }
.ap-dark .text-rose-600 { color: #F2907E; }
.ap-dark .bg-emerald-100 { background-color: rgba(134, 196, 148, 0.16); }
.ap-dark .bg-rose-100 { background-color: rgba(242, 144, 126, 0.16); }
.ap-dark .bg-zinc-100 { background-color: rgba(245, 243, 239, 0.08); }
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

const THEME_KEY = 'astanapets:theme';

function loadTheme() {
  try {
    return window.localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
  } catch (_) {
    return 'light';
  }
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
  const index = Math.max(0, SPECIES_TABS.findIndex((t) => t.value === value));
  return (
    <div role="tablist" aria-label="Вид животного" className="relative grid grid-cols-3 gap-1.5 rounded-2xl ap-sand-deep p-1.5">
      {/* Плашка активной вкладки плавно переезжает между «Все / Собаки / Кошки» */}
      <span
        aria-hidden="true"
        className="ap-btn-accent ap-tab-slider pointer-events-none absolute bottom-1.5 left-1.5 top-1.5 rounded-xl"
        style={{ transform: `translateX(calc(${index} * (100% + 0.375rem)))` }}
      />
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
            className={`relative z-10 flex items-center justify-center gap-2 rounded-xl px-2 py-3 text-sm transition-colors duration-300 sm:text-base ${
              active ? 'ap-tab-on font-bold' : 'ap-tab-idle font-semibold'
            }`}
          >
            <Icon className={`h-5 w-5 shrink-0 transition-transform duration-300 ${active ? 'scale-110' : ''}`} />
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
        <Icon className={`h-4 w-4 shrink-0 ${checked ? 'ap-ivory-text' : 'ap-text-sage-deep'}`} />
        {label}
      </span>
      <span className="relative inline-flex shrink-0">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span
          className={`h-6 w-11 rounded-full transition-colors duration-300 peer-focus-visible:ring-2 peer-focus-visible:ring-stone-400 ${
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
    <div className={`rounded-2xl border ap-line ${compact ? 'ap-surface p-3' : 'ap-sand p-4'}`}>
      <div className="mb-2 flex items-center justify-between text-xs font-bold">
        <span className="ap-text-soft">{done ? 'Сбор закрыт 🎉' : 'Прозрачный сбор'}</span>
        <span className={done ? 'ap-text-sage-deep' : 'ap-text-accent'}>{pct}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full ap-track-off">
        <div
          className={`h-full rounded-full transition-all duration-700 ${done ? 'ap-sage-fill' : 'ap-progress-fill'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs leading-relaxed ap-text-muted">
        Собрано <b className="font-bold ap-text-main">{formatKZT(collected)}</b> из {formatKZT(goal)}
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
        className={`h-5 w-5 transition-colors duration-300 ${active ? 'ap-pop ap-heart-on' : 'ap-text-muted'}`}
      />
    </button>
  );
}

// Блокировка прокрутки страницы под открытым окном. overflow:hidden Safari на iPhone/iPad игнорирует,
// поэтому «замораживаем» body на текущей позиции и возвращаем прокрутку туда же после закрытия.
let scrollLocks = 0;
let lockedScrollY = 0;

function useScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined;
    const body = document.body;
    if (scrollLocks === 0) {
      lockedScrollY = window.scrollY;
      Object.assign(body.style, { position: 'fixed', top: `-${lockedScrollY}px`, left: '0', right: '0', width: '100%', overflow: 'hidden' });
    }
    scrollLocks += 1;
    return () => {
      scrollLocks -= 1;
      if (scrollLocks === 0) {
        Object.assign(body.style, { position: '', top: '', left: '', right: '', width: '', overflow: '' });
        // instant: в index.css включена плавная прокрутка, а здесь нужно вернуться на место мгновенно
        window.scrollTo({ top: lockedScrollY, left: 0, behavior: 'instant' });
      }
    };
  }, [active]);
}

// Плавное закрытие: сначала проигрываем анимацию ухода, потом сообщаем родителю
const CLOSE_MS = 240;

function useAnimatedClose(open, onClose) {
  const [closing, setClosing] = useState(false);
  const timer = useRef(null);
  useEffect(() => {
    setClosing(false);
    return () => window.clearTimeout(timer.current);
  }, [open]);
  const requestClose = useCallback(() => {
    if (closing) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      onClose();
      return;
    }
    setClosing(true);
    timer.current = window.setTimeout(onClose, CLOSE_MS);
  }, [closing, onClose]);
  return [closing, requestClose];
}

function Modal({ open, onClose, children, labelledBy }) {
  const [closing, requestClose] = useAnimatedClose(open, onClose);
  useScrollLock(open);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && requestClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, requestClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
      <div className={`ap-backdrop ap-overlay absolute inset-0 backdrop-blur-sm ${closing ? 'is-closing' : ''}`} onClick={requestClose} />
      <div
        className={`ap-modal-panel relative flex w-full flex-col overflow-hidden rounded-t-3xl ap-modal-bg ap-shadow-soft sm:max-w-lg sm:rounded-3xl ${
          closing ? 'is-closing' : ''
        }`}
      >
        <div className="absolute left-1/2 top-2 z-10 h-1.5 w-12 -translate-x-1/2 rounded-full ap-glass ap-shadow-soft sm:hidden" />
        <button
          type="button"
          onClick={requestClose}
          aria-label="Закрыть"
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full ap-glass ap-text-strong ap-shadow-soft backdrop-blur-sm transition-all duration-300 hover:scale-105"
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

// Фото с запасными вариантами: если ссылка не открылась, пробуем следующее фото питомца,
// и только потом показываем заглушку с лапкой. no-referrer нужен для картинок Google.
function PhotoImg({ src, fallbacks = [], alt, className = '', eager = false }) {
  const candidates = useMemo(
    () => [src, ...fallbacks].filter((url, i, arr) => url && arr.indexOf(url) === i),
    [src, fallbacks]
  );
  const [attempt, setAttempt] = useState(0);

  useEffect(() => setAttempt(0), [src]);

  const current = candidates[attempt] || FALLBACK_PHOTO;
  return (
    <img
      src={current}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setAttempt((n) => (n < candidates.length ? n + 1 : n))}
      className={className}
    />
  );
}

/* =====================================================================
 * 7. СЕКЦИИ СТРАНИЦЫ
 * ===================================================================== */

/* ---------- Логотип: белая лапка с подушечкой-сердцем на коралловом фоне ---------- */
function AppLogo({ className = 'h-10 w-10' }) {
  return (
    <svg viewBox="0 0 48 48" className={`shrink-0 ${className}`} role="img" aria-label="Лапки Астаны">
      <rect width="48" height="48" rx="12" fill="#E36243" />
      <PawShape fill="#FFFFFF" />
    </svg>
  );
}

// Лапа из логотипа (без плашки): 4 пальчика полукругом и подушечка-сердце, в координатах 48×48
function PawShape({ fill = 'currentColor' }) {
  return (
    <g fill={fill}>
      <ellipse cx="12.6" cy="22" rx="2.7" ry="3.5" transform="rotate(-28 12.6 22)" />
      <ellipse cx="19.4" cy="14.6" rx="2.9" ry="3.8" transform="rotate(-10 19.4 14.6)" />
      <ellipse cx="28.6" cy="14.6" rx="2.9" ry="3.8" transform="rotate(10 28.6 14.6)" />
      <ellipse cx="35.4" cy="22" rx="2.7" ry="3.5" transform="rotate(28 35.4 22)" />
      <path d="M24 38.6C20.8 36.1 15.6 32.6 15.6 27.9C15.6 25.2 17.6 23.2 20.1 23.2C21.8 23.2 23.2 24.1 24 25.5C24.8 24.1 26.2 23.2 27.9 23.2C30.4 23.2 32.4 25.2 32.4 27.9C32.4 32.6 27.2 36.1 24 38.6Z" />
    </g>
  );
}

/* ---------- Боковая шторка: тема, связь с автором, навигация ---------- */
/* ---------- Иконки мессенджеров ----------
 * Положите официальные SVG из брендбуков Telegram и WhatsApp в папку public/icons/
 * (telegram.svg и whatsapp.svg, белые/монохромные версии для цветных кнопок).
 * Пока файлов нет — показывается стандартная иконка lucide-react.
 */
function BrandIcon({ src, fallback: Fallback, className = 'h-5 w-5' }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <Fallback className={className} />;
  return <img src={src} alt="" aria-hidden="true" className={`${className} object-contain`} onError={() => setFailed(true)} />;
}

const TELEGRAM_ICON_SRC = '/icons/telegram.svg';
const KASPI_ICON_SRC = '/icons/kaspi.png'; // белый знак Kaspi на прозрачном фоне — для красной кнопки
const WHATSAPP_ICON_SRC = '/icons/whatsapp.svg';

function SideDrawer({ open, onClose, theme, onThemeChange }) {
  const [closing, requestClose] = useAnimatedClose(open, onClose);
  useScrollLock(open);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && requestClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, requestClose]);

  if (!open) return null;

  const goTo = (id) => {
    trackEvent('menu_nav_clicked', { target: id });
    requestClose();
    // ждём, пока шторка уедет и вернётся прокрутка страницы
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), CLOSE_MS + 60);
  };

  const THEMES = [
    { value: 'light', label: 'Светлая', icon: Sun },
    { value: 'dark', label: 'Тёмная', icon: Moon },
  ];

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Меню">
      <div className={`ap-backdrop ap-overlay absolute inset-0 backdrop-blur-sm ${closing ? 'is-closing' : ''}`} onClick={requestClose} />
      <aside
        className={`ap-drawer-panel ap-modal-bg absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col overflow-y-auto overscroll-contain border-l ap-line ${
          closing ? 'is-closing' : ''
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b ap-line-soft px-5 py-4">
          <div className="flex items-center gap-2.5">
            <AppLogo className="h-9 w-9" />
            <span className="text-lg font-bold tracking-tight ap-text-main">Меню</span>
          </div>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Закрыть меню"
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 ap-chip-idle transition-all duration-300 active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 p-5">
          <section>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider ap-text-faint">Тема оформления</p>
            <div className="grid grid-cols-2 gap-1.5 rounded-2xl ap-sand-deep p-1.5" role="radiogroup" aria-label="Тема оформления">
              {THEMES.map((t) => {
                const active = theme === t.value;
                const Icon = t.icon;
                return (
                  <button
                    key={t.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => onThemeChange(t.value)}
                    className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold transition-all duration-300 ${
                      active ? 'ap-btn-accent' : 'ap-tab-idle'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider ap-text-faint">Разделы</p>
            <div className="divide-y ap-divide overflow-hidden rounded-2xl border ap-line ap-paper">
              {[
                { id: 'catalog', label: 'Каталог питомцев', icon: PawPrint },
                { id: 'help', label: 'Помочь приютам', icon: Heart },
                { id: 'faq', label: 'Частые вопросы', icon: HelpCircle },
              ].map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => goTo(link.id)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left text-base font-semibold ap-text-main transition-colors duration-300 ap-hover-accent-soft"
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-5 w-5 ap-text-accent" />
                      {link.label}
                    </span>
                    <ChevronRight className="h-5 w-5 ap-text-faint" />
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

function Header({ favoritesCount, favoritesOnly, onToggleFavorites, onOpenMenu }) {
  return (
    <header className="sticky top-0 z-40 border-b ap-line-soft ap-header-glass backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <a href="#top" className="flex items-center gap-2.5">
          <AppLogo className="h-11 w-11" />
          <span className="leading-tight">
            <span className="block text-lg font-bold ap-text-main">Лапки Астаны</span>
            <span className="block text-xs font-semibold ap-text-soft">AstanaPets</span>
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
            <Heart className={`h-4 w-4 ${favoritesOnly ? 'ap-fill-ivory' : favoritesCount ? 'ap-heart-on' : ''}`} />
            <span>{favoritesCount}</span>
          </button>
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Открыть меню"
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 ap-chip-idle transition-all duration-300 active:scale-95"
          >
            <Menu className="h-5 w-5" />
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
  const fillers = MOCK_PETS.map(normalizePet)
    .filter((p) => !usedIds.has(p.id) && !usedPhotos.has(p.photo_url))
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
              fallbacks={pet.photos}
              alt={isFiller ? 'Питомец из приюта' : pet.name}
              eager={priority}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="ap-photo-fade-bottom absolute inset-x-0 bottom-0 h-1/3" />
            {badge}
            {!isFiller && (
              <div className="absolute inset-x-3 bottom-3 text-left ap-ivory-text">
                <p className="text-lg font-bold leading-tight">{pet.name}</p>
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
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full ap-badge-honey px-3 py-1 text-xs font-bold">
              <Heart className="h-3.5 w-3.5 ap-heart-on" />
              Ищет семью
            </span>
          }
        />
      </div>
      <div className="absolute bottom-0 right-20 z-20">
        <PolaroidPhoto slot={c} widthClass="w-52" tilt="-rotate-2" floatClass="ap-float-late" badge={null} />
      </div>
      <figure className="ap-card absolute bottom-2 left-4 z-30 w-60 rounded-2xl border ap-line p-4">
        <Quote className="h-5 w-5 ap-text-accent" />
        <blockquote className="mt-1 text-sm font-semibold leading-snug ap-text-strong">
          Каждого питомца проверил куратор приюта. Вы знакомитесь вживую, без посредников.
        </blockquote>
        <figcaption className="mt-2 text-xs font-bold ap-text-faint">— команда AstanaPets</figcaption>
      </figure>
    </div>
  );
}

function MobilePreviewSlider({ pets, onOpenPet }) {
  if (!pets.length) return null;
  return (
    <div className="w-full min-w-0 max-w-full lg:hidden">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-bold ap-text-main">Ждут знакомства</p>
        <p className="flex items-center gap-1 text-xs font-semibold ap-text-soft">
          листайте <ChevronRight className="h-3.5 w-3.5" />
        </p>
      </div>
      <div className="ap-no-scrollbar w-full max-w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain">
        <div className="flex w-max gap-3 pb-2">
          {pets.map((pet, i) => (
            <button
              key={pet.id}
              type="button"
              onClick={() => onOpenPet(pet)}
              className="ap-card group w-36 shrink-0 snap-start rounded-3xl p-1.5 text-left transition-all duration-300 active:scale-95"
            >
              <div className="ap-portrait relative overflow-hidden rounded-2xl ap-sand-deep">
                <PhotoImg
                  src={pet.photos?.[0] || pet.photo_url}
                  fallbacks={pet.photos}
                  alt={pet.name}
                  eager={i < 3}
                  className="h-full w-full object-cover"
                />
                <div className="ap-photo-fade-bottom absolute inset-x-0 bottom-0 h-1/2" />
                {i === 0 && (
                  <span className="absolute left-2 top-2 rounded-full ap-sage px-2 py-0.5 text-xs font-bold ap-shadow-soft">Спасён в Астане</span>
                )}
                {i === 1 && <span className="absolute left-2 top-2 rounded-full ap-badge-honey px-2 py-0.5 text-xs font-bold">Ищет семью</span>}
                <div className="absolute inset-x-2 bottom-2 ap-ivory-text">
                  <p className="text-base font-bold leading-tight">{pet.name}</p>
                  <p className="text-xs font-semibold opacity-90">{formatAge(pet.age_months)}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
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
    <section id="top" className="ap-cream-block relative w-full overflow-hidden border-b ap-line-soft">
      <div className="relative mx-auto grid w-full min-w-0 max-w-6xl grid-cols-1 items-center gap-8 px-4 pb-6 pt-8 sm:pt-12 lg:grid-cols-2 lg:gap-12 lg:pb-16 lg:pt-16">
        <div className="min-w-0">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full ap-accent-soft px-3 py-1.5 text-xs font-bold ap-text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            Приюты Астаны — в одном месте
          </span>
          <h1 className="break-words text-2xl font-bold leading-tight tracking-tight ap-text-main sm:text-4xl lg:text-5xl">
            Найди друга из приюта в Астане и <span className="ap-text-accent">помоги тем, кто ещё ждёт дом</span>
          </h1>

          <div className="ap-card mt-6 flex w-full max-w-full items-start gap-3 rounded-2xl border ap-line px-4 py-3 text-sm ap-text-strong sm:inline-flex sm:w-auto sm:items-center">
            <span className="relative mt-1 flex h-3 w-3 shrink-0 sm:mt-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full ap-sage-fill opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full ap-sage-fill" />
            </span>
            <span className="min-w-0 break-words font-semibold leading-snug">
              Сейчас ищут дом: <b className="font-bold ap-sage-text">{petsCount}</b> {pluralRu(petsCount, ['питомец', 'питомца', 'питомцев'])} из{' '}
              <b className="font-bold ap-sage-text">{sheltersCount}</b>{' '}
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

          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold ap-text-muted">
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

        <div className="hidden min-w-0 lg:block">
          <HeroCollage pets={previewPets} onOpenPet={onOpenPet} />
        </div>

        <MobilePreviewSlider pets={previewPets} onOpenPet={onOpenPet} />
      </div>
    </section>
  );
}

// За кнопкой «Ещё фильтры» — только тумблеры; вид, пол, возраст и размер всегда на виду
const ADVANCED_KEYS = [
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
  const basicGroups = FILTER_GROUPS.filter((g) => g.key !== 'species');
  const highlighted = open || advancedCount > 0;

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    trackEvent('advanced_filters_toggled', { open: next, active_filters: advancedCount });
  };

  return (
    <div className="ap-card space-y-4 rounded-3xl border ap-line p-4 sm:p-5">
      <SpeciesTabs value={filters.species} onChange={(v) => setFilter('species', v)} />

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ap-text-faint" />
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
          Ещё фильтры
          {advancedCount > 0 && (
            <span className="inline-flex h-6 items-center justify-center rounded-full ap-btn-caramel px-2 text-xs font-bold">
              {advancedCount}
            </span>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-x-8">
        {basicGroups.map((group) => (
          <div key={group.key} className="min-w-0">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide ap-text-soft">{group.label}</p>
            <div className="ap-no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
              {group.options.map((opt) => (
                <Chip key={opt.value} icon={opt.icon} active={filters[group.key] === opt.value} onClick={() => setFilter(group.key, opt.value)}>
                  {opt.label}
                </Chip>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div id="advanced-filters" className={`ap-collapse ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <div>
          <div className="space-y-4 border-t ap-line pt-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide ap-text-soft">Здоровье и характер</p>
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
        <p className="text-sm font-semibold ap-text-muted">
          Найдено: <b className="font-bold ap-text-main">{resultsCount}</b>
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

// «Я Живой» → Приют «Я Живой» (не дублируем слово и кавычки, если они уже есть)
function shelterLabel(name) {
  const n = cleanText(name);
  if (/^приют/i.test(n)) return n;
  return /^[«"]/.test(n) ? `Приют ${n}` : `Приют «${n}»`;
}

// Бейджи в шапке окна питомца: «Проверен», «из: [Приют]» и (по желанию) статус чипирования
function ShelterBadges({ pet, withChip = false, className = '' }) {
  const chipped = Boolean(pet.chip_number) || pet.is_registered;
  if (!pet.shelter_verified && !pet.shelter_name && !withChip) return null;
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {pet.shelter_verified && (
        <span className="ap-badge-verified inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
          Проверен
        </span>
      )}
      {pet.shelter_name && (
        <span className="ap-badge-shelter inline-flex min-w-0 max-w-full items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold">
          <Home className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">из: {pet.shelter_name}</span>
        </span>
      )}
      {withChip && (
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${
            chipped ? 'ap-badge-verified' : 'ap-badge-shelter'
          }`}
        >
          <Cpu className="h-3.5 w-3.5 shrink-0" />
          {chipped ? 'Чипирован' : 'Чипирование при передаче'}
        </span>
      )}
    </div>
  );
}

// Мини-сбор для карточки каталога: одна строка текста и полоска (полный блок — в анкете)
function CardFundraiser({ collected, goal, purpose }) {
  const pct = Math.min(100, Math.round((collected / goal) * 100));
  const done = collected >= goal;
  return (
    <div className="rounded-2xl border ap-line ap-surface px-3 py-2.5">
      <div className="flex items-center justify-between gap-2 text-xs font-bold">
        <span className="min-w-0 truncate ap-text-soft">{done ? 'Сбор закрыт 🎉' : `Идёт сбор${purpose ? ` на ${purpose}` : ''}`}</span>
        <span className={`shrink-0 ${done ? 'ap-text-sage-deep' : 'ap-text-accent'}`}>{pct}%</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full ap-track-off">
        <div className={`h-full rounded-full ${done ? 'ap-sage-fill' : 'ap-progress-fill'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// Теги характера: плашки по ширине текста, не больше maxRows рядов; что не влезло — «+N» (полный список в анкете).
// Ширину меряем по невидимой копии строки, пересчитываем при изменении размера карточки и после загрузки шрифта.
const TAG_GAP = 6;

// Раскладка первых count плашек по рядам; true, если влезли в maxRows рядов (с местом под «+N», если нужно)
function fitsInRows(widths, count, available, maxRows, moreWidth) {
  let rows = 1;
  let line = 0;
  for (let i = 0; i < count; i += 1) {
    const add = (line > 0 ? TAG_GAP : 0) + widths[i];
    if (line > 0 && line + add > available) {
      rows += 1;
      line = widths[i];
    } else {
      line += add;
    }
    if (rows > maxRows || line > available) return false;
  }
  if (count < widths.length) {
    // «+N» должен встать в конец последнего ряда или начать новый, если ряды ещё остались
    if (line + TAG_GAP + moreWidth > available) return rows < maxRows;
  }
  return true;
}

function TagRow({ tags, maxRows = 1 }) {
  const boxRef = useRef(null);
  const measureRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(tags.length);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const measure = measureRef.current;
    if (!box || !measure) return undefined;
    const recalc = () => {
      const available = box.clientWidth;
      const chips = [...measure.children];
      const widths = chips.slice(0, tags.length).map((el) => el.offsetWidth);
      const moreWidth = chips[tags.length]?.offsetWidth || 0;
      let count = widths.length;
      while (count > 1 && !fitsInRows(widths, count, available, maxRows, moreWidth)) count -= 1;
      setVisibleCount(count);
    };
    recalc();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(recalc) : null;
    observer?.observe(box);
    document.fonts?.ready?.then(recalc).catch(() => {});
    return () => observer?.disconnect();
  }, [tags, maxRows]);

  if (tags.length === 0) return null;
  const hidden = tags.length - visibleCount;
  const chip = 'shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold';

  return (
    <div ref={boxRef} className="relative">
      <div data-tags className={`flex gap-1.5 ${maxRows > 1 ? 'flex-wrap' : 'overflow-hidden'}`}>
        {tags.slice(0, visibleCount).map((t) => (
          <span key={t} className={`${chip} ${tagClass(t)}`}>
            {t}
          </span>
        ))}
        {hidden > 0 && (
          <span className={`${chip} ap-tag-more`} title={tags.slice(visibleCount).join(', ')}>
            +{hidden}
          </span>
        )}
      </div>
      {/* Невидимая копия для замера ширины плашек */}
      <div ref={measureRef} aria-hidden="true" className="pointer-events-none invisible absolute left-0 top-0 flex gap-1.5">
        {tags.map((t) => (
          <span key={t} className={`${chip} ${tagClass(t)}`}>
            {t}
          </span>
        ))}
        <span className={`${chip} ap-tag-more`}>+{tags.length}</span>
      </div>
    </div>
  );
}

function PetCard({ pet, onOpen, onDonate, isFavorite, onToggleFavorite }) {
  const hasFundraiser = pet.fundraising_goal_kzt > 0;
  const tags = useMemo(() => sortTagsByCategory(splitTags(pet.character_tags)), [pet.character_tags]);
  // Обложка 4:3 с умным кадрированием (для Cloudinary) и запасными фото
  const coverSrc = getSmartPhotoUrl(pet.photo_url);
  const coverFallbacks = useMemo(() => (pet.photos || []).map(getSmartPhotoUrl), [pet.photos]);

  return (
    // Клик по любому месту карточки открывает анкету; кнопки «Помочь» и ♡ останавливают всплытие
    <article
      onClick={() => onOpen(pet)}
      className="ap-card ap-card-hover group flex cursor-pointer flex-col overflow-hidden rounded-3xl border ap-line transition-all duration-300 hover:-translate-y-1"
    >
      <div className="ap-photo relative w-full overflow-hidden ap-sand-deep">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(pet);
          }}
          aria-label={`Открыть карточку: ${pet.name}`}
          className="absolute inset-0 block h-full w-full"
        >
          <PhotoImg
            src={coverSrc}
            fallbacks={coverFallbacks}
            alt={`${pet.name} — ${pet.species === 'dog' ? 'собака' : 'кошка'} из приюта`}
            className="ap-focus-face h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </button>
        <div className="ap-photo-fade pointer-events-none absolute inset-x-0 top-0 h-2/3" />
        <div className="pointer-events-none absolute left-3 right-16 top-3 flex flex-col items-start gap-1.5">
          {pet.shelter_verified && (
            <span className="ap-badge-verified inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              Проверен
            </span>
          )}
        </div>
        <FavoriteButton active={isFavorite} onToggle={() => onToggleFavorite(pet)} className="absolute right-3 top-3" />
        {pet.photos && pet.photos.length > 1 && (
          <span className="ap-photo-count pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold backdrop-blur-sm">
            <Camera className="h-3.5 w-3.5" />
            {pet.photos.length} фото
          </span>
        )}
      </div>

      {/* Лёгкая карточка: кличка, характер и кнопки; всё остальное — в анкете по нажатию */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-2xl font-bold tracking-tight ap-text-main">{pet.name}</h3>

        {/* Без сбора теги занимают до трёх рядов; если идёт сбор — одна строка и мини-полоска сбора под ней */}
        <TagRow tags={tags} maxRows={hasFundraiser ? 1 : 3} />

        {hasFundraiser && (
          <CardFundraiser collected={pet.fundraising_collected_kzt} goal={pet.fundraising_goal_kzt} purpose={pet.fundraising_purpose} />
        )}

        <div className="mt-auto flex gap-2 pt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(pet);
            }}
            className="inline-flex flex-1 items-center justify-center rounded-2xl ap-btn-accent px-4 py-3.5 text-sm font-bold transition-all duration-300 active:scale-95"
          >
            Подробнее
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDonate(pet);
            }}
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

/* ---------- Детальная карточка: секции в стиле профиля Petfinder ---------- */

// Каталог делится на ряды по 6 анкет; в каждом ряду видно по 3 (на компьютере), остальные — пролистыванием
const CAROUSEL_ROW_SIZE = 6;

function chunk(items, size) {
  const rows = [];
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size));
  return rows;
}

// Карусель каталога: карточки в один ряд, листаются стрелками ‹ › (на широком экране — по бокам) и свайпом.
// Карточка: 85% ширины на телефоне, 2 в ряд на планшете, 3 — на компьютере. Стрелка видна, только если есть куда листать.
function PetCarousel({ children, resetKey }) {
  const trackRef = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: true });
  const count = React.Children.count(children);

  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    el.scrollTo({ left: 0, behavior: 'instant' }); // фильтры сменились — показываем список с начала
    updateEdges();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateEdges) : null;
    observer?.observe(el);
    return () => observer?.disconnect();
  }, [resetKey, count, updateEdges]);

  const scrollByPage = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.firstElementChild;
    const step = card ? card.getBoundingClientRect().width + 24 : el.clientWidth;
    const perPage = Math.max(1, Math.round(el.clientWidth / step));
    el.scrollBy({ left: dir * step * perPage, behavior: 'smooth' });
    trackEvent('catalog_carousel_scrolled', { direction: dir > 0 ? 'next' : 'prev' });
  };

  const arrow = 'ap-card absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border ap-line ap-text-main ap-shadow-soft transition-all duration-300 hover:scale-105 md:flex';

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={updateEdges}
        className="ap-no-scrollbar -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-px-4 px-4 pb-2 pt-1"
      >
        {React.Children.map(children, (child) => (
          <div className="flex w-[85%] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]">
            <div className="flex w-full flex-col [&>article]:flex-1">{child}</div>
          </div>
        ))}
      </div>
      {!edges.start && (
        <button type="button" onClick={() => scrollByPage(-1)} aria-label="Предыдущие питомцы" className={`${arrow} -left-3 xl:-left-16`}>
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}
      {!edges.end && (
        <button type="button" onClick={() => scrollByPage(1)} aria-label="Следующие питомцы" className={`${arrow} -right-3 xl:-right-16`}>
          <ChevronRight className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <section className="border-t ap-line pt-5">
      <h3 className="mb-1 text-xs font-bold uppercase tracking-wider ap-text-faint">{title}</h3>
      <div className="divide-y ap-divide">{children}</div>
    </section>
  );
}

// Положительный статус — изумрудный, отрицательный — тёплый терракотово-оранжевый
const STATUS_ICON = {
  yes: { Icon: Check, icon: 'text-emerald-600', text: 'text-emerald-700' },
  no: { Icon: X, icon: 'ap-neg', text: 'ap-neg' },
};

// Строка характеристики: иконка + подпись слева, значение (и при необходимости статус) справа
// Значки пола в стиле lucide (текстовые ♀/♂ на iPhone съезжают вниз из-за метрик шрифта)
function VenusIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="9" r="6" />
      <path d="M12 15v7M9 19h6" />
    </svg>
  );
}

function MarsIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="10" cy="14" r="6" />
      <path d="M14.5 9.5 21 3M15 3h6v6" />
    </svg>
  );
}

function DetailRow({ icon: Icon, glyph, label, value, status }) {
  const st = status ? STATUS_ICON[status] : null;
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <span className="flex min-w-0 items-center gap-3 text-sm font-semibold ap-text-strong">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ap-sand ap-text-muted">
          {Icon ? <Icon className="h-4 w-4" /> : <span className="text-base font-bold leading-none">{glyph}</span>}
        </span>
        <span className="min-w-0">{label}</span>
      </span>
      <span className={`flex shrink-0 items-center gap-1.5 text-right text-sm font-semibold ${st ? st.text : 'ap-text-main'}`}>
        {st && <st.Icon className={`h-4 w-4 ${st.icon}`} strokeWidth={2.75} />}
        {value}
      </span>
    </div>
  );
}

const COMPAT_STATUS = {
  yes: { Icon: Check, icon: 'text-emerald-600', circle: 'bg-emerald-100', label: 'text-emerald-700 font-bold', text: 'Да' },
  no: { Icon: X, icon: 'ap-neg', circle: 'ap-neg-soft', label: 'ap-neg font-bold', text: 'Нет' },
  unknown: { Icon: HelpCircle, icon: 'text-zinc-500', circle: 'bg-zinc-100', label: 'text-zinc-600 font-semibold', text: 'Неизвестно' },
};

function CompatTile({ icon: Icon, label, value }) {
  const st = COMPAT_STATUS[value] || COMPAT_STATUS.unknown;
  return (
    <div className="relative rounded-2xl border ap-line ap-paper px-3 pb-3.5 pt-7 text-center">
      <span className={`absolute right-2 top-2 inline-flex rounded-full p-1 ${st.circle}`} aria-hidden="true">
        <st.Icon className={`h-4 w-4 ${st.icon}`} strokeWidth={3} />
      </span>
      <Icon className="mx-auto h-8 w-8 text-zinc-700" aria-hidden="true" />
      <p className="mt-2 text-sm font-bold text-zinc-900">{label}</p>
      <p className={`mt-0.5 text-xs ${st.label}`}>{st.text}</p>
    </div>
  );
}

/* ---------- Фотогалерея в карточке питомца ---------- */
// Главный кадр: размытая копия фото на фоне + само фото целиком (object-contain),
// поэтому вертикальные снимки с телефона показываются без обрезки.
function PetGallery({ pet }) {
  const photos = pet.photos && pet.photos.length ? pet.photos : [pet.photo_url || FALLBACK_PHOTO];
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);
  const thumbRefs = useRef([]);
  const many = photos.length > 1;

  const goTo = useCallback(
    (next, method) => {
      const photoIndex = (next + photos.length) % photos.length;
      setIndex(photoIndex);
      trackEvent('pet_photo_switched', { id: pet.id, photoIndex, method });
    },
    [photos.length, pet.id]
  );

  // Листание стрелками клавиатуры
  useEffect(() => {
    if (!many) return undefined;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') goTo(index + 1, 'keyboard');
      if (e.key === 'ArrowLeft') goTo(index - 1, 'keyboard');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [many, index, goTo]);

  // Активная миниатюра всегда видна в ленте
  useEffect(() => {
    thumbRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }, [index]);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null || !many) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1), 'swipe');
  };

  const current = photos[index];

  return (
    <div>
      <div
        className="relative h-72 w-full overflow-hidden rounded-2xl ap-sand-deep sm:h-96"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <PhotoImg key={`bg-${index}`} src={current} alt="" eager className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-xl" />
        <PhotoImg
          key={`fg-${index}`}
          src={current}
          alt={many ? `${pet.name} — фото ${index + 1} из ${photos.length}` : pet.name}
          eager
          className="ap-toast relative z-10 h-full w-full object-contain"
        />

        {many && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1, 'arrow')}
              aria-label="Предыдущее фото"
              className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full ap-glass ap-text-strong ap-shadow-soft transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1, 'arrow')}
              aria-label="Следующее фото"
              className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full ap-glass ap-text-strong ap-shadow-soft transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="ap-photo-count absolute bottom-3 right-3 z-20 rounded-full px-2.5 py-1 text-xs font-bold backdrop-blur-sm">
              {index + 1} / {photos.length}
            </span>
          </>
        )}
      </div>

      {many && (
        <div className="ap-no-scrollbar mt-3 flex gap-2 overflow-x-auto p-1" role="tablist" aria-label="Фотографии питомца">
          {photos.map((src, i) => (
            <button
              key={`${src}-${i}`}
              ref={(el) => {
                thumbRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Фото ${i + 1}`}
              onClick={() => i !== index && goTo(i, 'thumb')}
              className={`h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-xl transition-all duration-300 ${
                i === index ? 'ap-thumb-active' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <PhotoImg src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PetDetailsModal({ pet, onClose, onDonate, notify, isFavorite, onToggleFavorite }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => setRevealed(false), [pet?.id]);

  if (!pet) return null;

  const tags = sortTagsByCategory(splitTags(pet.character_tags));
  const waText = `Здравствуйте! Увидел(а) ${pet.name} на сайте AstanaPets, хочу узнать подробнее...`;
  const waLink = `https://wa.me/${whatsappNumber(pet.curator_whatsapp || pet.curator_phone)}?text=${encodeURIComponent(waText)}`;
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
      <div className="relative flex min-h-16 items-start px-4 pb-3 pr-28 pt-[19px] sm:px-6 sm:pr-28">
        <ShelterBadges pet={pet} withChip className="min-w-0 flex-1" />
        <FavoriteButton active={isFavorite} onToggle={() => onToggleFavorite(pet)} className="absolute right-16 top-3" />
      </div>

      <div className="px-4 sm:px-6">
        <PetGallery key={pet.id} pet={pet} />
      </div>

      <div className="space-y-6 p-5 pb-8 sm:p-6">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h2 id="pet-modal-title" className="min-w-0 text-3xl font-bold tracking-tight ap-text-main">
              {pet.name}
            </h2>
            <button
              type="button"
              onClick={() => sharePet({ pet, shelterName: pet.shelter_name, notify, source: 'pet_modal' })}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border ap-line ap-chip-idle px-3.5 py-2 text-sm font-bold transition-all duration-300 active:scale-95"
            >
              <Share className="h-4 w-4" />
              Поделиться
            </button>
          </div>
          <p className="mt-1 text-sm font-semibold ap-text-soft">
            {pet.species === 'dog' ? 'Собака' : 'Кошка'} · {[SEX_LABEL[pet.sex], formatAge(pet.age_months), SIZE_LABEL[pet.size]].filter(Boolean).join(' · ')}
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
          <h3 className="mb-2 text-lg font-bold ap-text-main tracking-tight">История и характер</h3>
          <p className="ap-prose text-base ap-text-muted">{pet.description}</p>
        </section>

        <DetailSection title="Порода и внешность">
          <DetailRow icon={Tag} label="Порода" value={pet.breed} />
          <DetailRow icon={Calendar} label="Возраст" value={pet.age_months > 0 ? formatAge(pet.age_months) : 'Уточняется'} />
          <DetailRow icon={pet.sex === 'female' ? VenusIcon : MarsIcon} label="Пол" value={SEX_LABEL[pet.sex]} />
          <DetailRow icon={Ruler} label="Размер" value={SIZE_LABEL[pet.size] || "Не указан"} />
        </DetailSection>

        <DetailSection title="Поведение и быт">
          <DetailRow
            icon={Award}
            label={pet.species === 'cat' ? 'Приучение к лотку' : 'Приучение к выгулу'}
            status={pet.house_trained ? 'yes' : 'no'}
            value={pet.house_trained ? 'Да' : 'Пока нет, учится'}
          />
          <DetailRow
            icon={Home}
            label="Подходит для квартиры"
            status={pet.apartment_friendly ? 'yes' : 'no'}
            value={pet.apartment_friendly ? 'Да' : 'Лучше частный дом'}
          />
          <DetailRow
            icon={Smile}
            label="Подойдёт новичку"
            status={pet.beginner_friendly ? 'yes' : 'no'}
            value={pet.beginner_friendly ? 'Да' : 'Нужен опыт'}
          />
        </DetailSection>

        <DetailSection title="Здоровье и документы (РК)">
          <DetailRow
            icon={Scissors}
            label="Стерилизация / кастрация"
            status={pet.is_sterilized ? 'yes' : 'no'}
            value={pet.is_sterilized ? 'Выполнена' : 'Пока нет'}
          />
          <DetailRow
            icon={Syringe}
            label="Вакцинация"
            status={pet.is_vaccinated ? 'yes' : 'no'}
            value={pet.is_vaccinated ? 'По возрасту' : 'Пока нет'}
          />
          <DetailRow
            icon={Bug}
            label="Обработка от паразитов"
            status={pet.is_parasite_treated ? 'yes' : 'no'}
            value={pet.is_parasite_treated ? 'Выполнена' : 'Пока нет'}
          />
          <DetailRow
            icon={Cpu}
            label="Чип"
            status={pet.chip_number ? 'yes' : 'no'}
            value={pet.chip_number ? `№${pet.chip_number}` : 'При передаче'}
          />
          <DetailRow
            icon={FileText}
            label="Регистрация в базе учёта"
            status={pet.is_registered ? 'yes' : 'no'}
            value={pet.is_registered ? 'Да' : 'При передаче'}
          />
          <p className="flex items-start gap-1.5 pt-3 text-xs font-medium ap-text-soft">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            По правилам ответственного обращения с животными в РК питомец должен быть идентифицирован (чип) и зарегистрирован на нового владельца.
          </p>
        </DetailSection>

        <section className="border-t ap-line pt-5">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider ap-text-faint">Совместимость: {pet.name}</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <CompatTile icon={Baby} label="Дети" value={pet.compat_kids} />
            <CompatTile icon={Dog} label="Собаки" value={pet.compat_dogs} />
            <CompatTile icon={Cat} label="Кошки" value={pet.compat_cats} />
            <CompatTile icon={PawPrint} label="Другие животные" value={pet.compat_animals} />
          </div>
        </section>

        <ProgressBar collected={pet.fundraising_collected_kzt} goal={pet.fundraising_goal_kzt} purpose={pet.fundraising_purpose} />

        <section>
          <h3 className="mb-3 text-lg font-bold ap-text-main tracking-tight">Как забрать питомца</h3>
          <ol className="space-y-2">
            {['Связаться с куратором', 'Познакомиться в приюте', 'Оформить передачу и регистрацию чипа'].map((step, i) => (
              <li key={step} className="flex items-center gap-3 rounded-2xl border ap-line ap-sand px-4 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full ap-btn-accent text-sm font-bold">
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
              <p className="text-sm font-semibold ap-text-muted">
                {cleanText(pet.curator_name) ? (
                  <>
                    Куратор: <b className="font-bold ap-text-main">{cleanText(pet.curator_name)}</b>
                    {pet.shelter_name && <> · {shelterLabel(pet.shelter_name)}</>}
                  </>
                ) : (
                  <>
                    Куратор: <b className="font-bold ap-text-main">{shelterLabel(pet.shelter_name)}</b>
                  </>
                )}
              </p>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('whatsapp_clicked', base)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl ap-btn-whatsapp px-5 py-3.5 text-base font-bold transition-all duration-300 active:scale-95"
              >
                <BrandIcon src={WHATSAPP_ICON_SRC} fallback={MessageCircle} className="h-5 w-5" />
                Написать в WhatsApp
              </a>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${pet.curator_phone.replace(/\s/g, '')}`}
                  onClick={() => trackEvent('curator_phone_called', base)}
                  className="flex h-12 flex-1 items-center gap-2 rounded-2xl border-2 ap-field px-4 text-base font-bold"
                >
                  <Phone className="h-4 w-4 ap-text-soft" />
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
                  className="inline-flex items-center gap-1.5 text-sm font-bold ap-text-strong ap-link"
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

function DonateModal({ target, onClose, notify, onPaymentIntent }) {
  if (!target) return null;
  const { shelter, pet } = target;
  const base = { shelter: shelter.shelter_name, pet_id: pet?.id || null, pet_name: pet?.name || null };

  const copyKaspi = async () => {
    onPaymentIntent?.(target); // сразу: человек может уйти в Kaspi раньше, чем закончится копирование
    const ok = await copyToClipboard(shelter.kaspi_phone);
    notify(ok ? 'Номер Kaspi скопирован' : 'Не удалось скопировать');
    trackEvent('kaspi_phone_copied', base);
  };

  return (
    <Modal open={!!target} onClose={onClose} labelledBy="donate-modal-title">
      <div className="space-y-5 p-5 pb-8 pt-8 sm:p-6 sm:pt-8">
        <div className="pr-12">
          <span className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl ap-btn-caramel">
            <Heart className="h-7 w-7 ap-fill-ivory" />
          </span>
          <h2 id="donate-modal-title" className="text-2xl font-bold tracking-tight ap-text-main">
            Помочь приюту «{shelter.shelter_name}»
          </h2>
          {pet && <p className="mt-1 text-sm font-semibold ap-text-soft">Сбор в карточке: {pet.name}</p>}
        </div>

        {pet && <ProgressBar collected={pet.fundraising_collected_kzt} goal={pet.fundraising_goal_kzt} purpose={pet.fundraising_purpose} />}

        <div className="rounded-2xl border ap-line ap-sand p-4">
          <p className="text-xs font-bold uppercase tracking-wide ap-text-soft">На что идут средства</p>
          <p className="mt-1 text-base font-semibold ap-text-main">{shelter.donation_usage}</p>
          {shelter.reports_url && (
            <a
              href={shelter.reports_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('reports_link_clicked', base)}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold ap-text-strong underline decoration-stone-300 underline-offset-4 ap-link"
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
          onClick={() => {
            trackEvent('kaspi_link_clicked', base);
            onPaymentIntent?.(target);
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl ap-btn-kaspi px-5 py-4 text-base font-bold transition-all duration-300 active:scale-95"
        >
          <BrandIcon src={KASPI_ICON_SRC} fallback={Wallet} className="h-6 w-6" />
          Оплатить через Kaspi Pay
        </a>

        <div>
          <p className="mb-2 text-sm font-semibold ap-text-muted">Или по номеру Kaspi Gold куратора ({shelter.curator_name}):</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex h-12 flex-1 items-center rounded-2xl border-2 ap-field px-4 text-base font-bold">
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

        <p className="flex items-start gap-1.5 text-xs font-medium leading-relaxed ap-text-soft">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Деньги уходят приюту напрямую, без комиссии. Перед оплатой сверьте имя получателя в Kaspi.
        </p>
      </div>
    </Modal>
  );
}

// Радостный котёнок для окна благодарности
function HappyKitten({ className = '' }) {
  const ink = '#283618';
  return (
    <svg viewBox="0 0 220 190" className={className} aria-hidden="true" focusable="false">
      <circle cx="110" cy="100" r="82" fill="#F0C48F" opacity="0.22" />
      {/* сердечки и искорки */}
      <path className="ap-float-slow" d="M34 52 c-6 -5 -11 -10 -7 -14 c3 -3 6 -1 7 1 c1 -2 4 -4 7 -1 c4 4 -1 9 -7 14 z" fill="#E76F51" />
      <path className="ap-float" d="M186 40 c-7 -6 -13 -12 -8 -17 c3 -3 7 -1 8 2 c1 -3 5 -5 8 -2 c5 5 -1 11 -8 17 z" fill="#E76F51" />
      <path className="ap-float-late" d="M192 112 c-4 -4 -8 -7 -5 -10 c2 -2 4 -1 5 1 c1 -2 3 -3 5 -1 c3 3 -1 6 -5 10 z" fill="#DDA15E" />
      <path d="M24 108 l3 -8 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 z" fill="#F0C48F" />
      <path d="M160 18 l2 -6 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 z" fill="#F0C48F" />

      {/* тельце и поднятые от радости лапки */}
      <ellipse cx="110" cy="178" rx="48" ry="26" fill="#F2B66D" />
      <ellipse cx="110" cy="182" rx="26" ry="16" fill="#FCE3C0" />
      <path d="M66 150 C 52 128, 46 104, 50 86" fill="none" stroke="#F2B66D" strokeWidth="18" strokeLinecap="round" />
      <path d="M154 150 C 168 128, 174 104, 170 86" fill="none" stroke="#F2B66D" strokeWidth="18" strokeLinecap="round" />
      <circle cx="50" cy="82" r="12" fill="#FCE3C0" />
      <circle cx="170" cy="82" r="12" fill="#FCE3C0" />
      <circle cx="50" cy="85" r="4" fill="#F4A28C" />
      <circle cx="170" cy="85" r="4" fill="#F4A28C" />

      {/* ушки */}
      <path d="M66 82 L 68 30 L 104 58 Z" fill="#F2B66D" />
      <path d="M154 82 L 152 30 L 116 58 Z" fill="#F2B66D" />
      <path d="M73 70 L 74 42 L 95 58 Z" fill="#F4A28C" />
      <path d="M147 70 L 146 42 L 125 58 Z" fill="#F4A28C" />

      {/* голова */}
      <ellipse cx="110" cy="104" rx="56" ry="50" fill="#F2B66D" />
      <path d="M100 58 q4 10 0 18 M110 56 q4 12 0 22 M120 58 q4 10 0 18" fill="none" stroke="#DDA15E" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="110" cy="124" rx="30" ry="22" fill="#FCE3C0" />

      {/* большие блестящие глазки */}
      <ellipse cx="86" cy="102" rx="13" ry="15" fill={ink} />
      <ellipse cx="134" cy="102" rx="13" ry="15" fill={ink} />
      <circle cx="91" cy="96" r="5" fill="#fff" />
      <circle cx="139" cy="96" r="5" fill="#fff" />
      <circle cx="82" cy="108" r="2.5" fill="#fff" />
      <circle cx="130" cy="108" r="2.5" fill="#fff" />

      {/* щёчки, носик, широкая улыбка */}
      <ellipse cx="68" cy="122" rx="9" ry="6" fill="#F4A28C" opacity="0.75" />
      <ellipse cx="152" cy="122" rx="9" ry="6" fill="#F4A28C" opacity="0.75" />
      <path d="M104 116 h12 l-6 6 z" fill="#E76F51" />
      <path d="M98 126 Q 110 146 122 126 Z" fill="#8A3B2A" />
      <ellipse cx="110" cy="137" rx="6" ry="4" fill="#F4A28C" />
      <path d="M62 128 h-16 M63 134 l-15 4 M158 128 h16 M157 134 l15 4" stroke={ink} strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Благодарность после возвращения из Kaspi. Оплату мы не видим, поэтому текст не утверждает, что она прошла.
function ThanksModal({ target, onClose, notify }) {
  if (!target) return null;
  const { shelter, pet } = target;

  const share = () => sharePet({ pet, shelterName: shelter.shelter_name, notify, source: 'thanks' });

  return (
    <Modal open={!!target} onClose={onClose} labelledBy="thanks-modal-title">
      <div className="space-y-5 p-6 pb-8 text-center sm:p-8">
        <HappyKitten className="mx-auto h-44 w-auto" />
        <div>
          <h2 id="thanks-modal-title" className="text-2xl font-bold tracking-tight ap-text-main">
            Спасибо, что помогаете!
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-base font-medium leading-relaxed ap-text-muted">
            Каждый перевод — это корм, лечение и ещё один шанс найти дом. И спасибо, что пользуетесь AstanaPets: мы делаем его как раз для таких
            людей, как вы.
          </p>
        </div>
        {shelter.reports_url && (
          <p className="text-sm font-medium ap-text-soft">
            На что ушли деньги, {shelterLabel(shelter.shelter_name).replace(/^Приют/, 'приют')} показывает{' '}
            <a
              href={shelter.reports_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold ap-text-strong underline underline-offset-4 ap-link"
            >
              в своих отчётах
            </a>
            .
          </p>
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={share}
            className="inline-flex items-center justify-center gap-2 rounded-2xl ap-btn-accent px-5 py-3.5 text-base font-bold transition-all duration-300 active:scale-95"
          >
            <Send className="h-5 w-5" />
            Рассказать друзьям
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-2xl border-2 ap-chip-idle px-5 py-3.5 text-base font-bold transition-all duration-300"
          >
            Закрыть
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Ссылка на анкету: https://astanapets.vercel.app/?pet=pet-536 — открывает сайт сразу с этой анкетой
const PET_PARAM = 'pet';

function petUrl(pet) {
  return `${window.location.origin}/?${PET_PARAM}=${encodeURIComponent(pet.id)}`;
}

function readPetParam() {
  try {
    return new URLSearchParams(window.location.search).get(PET_PARAM);
  } catch {
    return null;
  }
}

// Держим адрес в строке браузера в соответствии с открытой анкетой (без новой записи в истории)
function syncPetParam(petId) {
  try {
    const url = new URL(window.location.href);
    if (petId) url.searchParams.set(PET_PARAM, petId);
    else url.searchParams.delete(PET_PARAM);
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch {
    /* без History API ссылка просто не обновится */
  }
}

// Сообщение для мессенджеров: короткие абзацы, призыв и ссылка (на анкету, если она есть)
function buildShareMessage(pet, shelterName) {
  const intro = pet
    ? `Привет! 🐾 Знакомься: это ${pet.name} из приюта «${shelterName}»${
        pet.sex === 'female' ? ', она ищет дом.' : pet.sex === 'male' ? ', он ищет дом.' : ' — ищет дом.'
      }`
    : 'Привет! 🐾 Смотри, какой сайт — «Лапки Астаны»: там кошки и собаки из проверенных приютов Астаны ищут дом.';
  const text = [
    intro,
    'На сайте можно выбрать питомца или поддержать приют переводом через Kaspi.',
    'Загляни, вдруг там твой будущий друг 👇',
  ].join('\n\n');
  return { text, url: pet ? petUrl(pet) : `${window.location.origin}/` };
}

// Системное окно «Поделиться» на телефоне; на компьютере — копируем сообщение со ссылкой
async function sharePet({ pet, shelterName, notify, source }) {
  const { text, url } = buildShareMessage(pet, shelterName);
  trackEvent(source === 'thanks' ? 'thanks_share_clicked' : 'pet_share_clicked', {
    pet_id: pet?.id || null,
    pet_name: pet?.name || null,
    shelter: shelterName,
  });
  try {
    if (navigator.share) {
      await navigator.share({ title: pet ? `${pet.name} — Лапки Астаны` : 'Лапки Астаны', text, url });
      return;
    }
  } catch {
    return; // человек закрыл окно «Поделиться»
  }
  const ok = await copyToClipboard(`${text}\n${url}`);
  notify(ok ? 'Ссылка скопирована — отправьте её друзьям' : 'Не удалось скопировать ссылку');
}

// Плашка демо-версии над шапкой сайта
function DemoBanner() {
  return (
    <div className="ap-demo-banner">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-2 px-4 py-2.5 text-sm font-semibold sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0" />
          Демо-версия для приютов: питомцы и контакты здесь вымышленные.
        </p>
        <button
          type="button"
          onClick={openAuthorTelegram}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm font-bold transition-colors duration-300 hover:bg-white/30"
        >
          Хочу такой сайт для приюта
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function SheltersSection({ shelters, onDonate }) {
  return (
    <section id="help" className="ap-forest-block scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <span className="inline-flex items-center gap-1.5 rounded-full ap-pill-on-dark px-3 py-1 text-xs font-bold">
          <Heart className="h-3.5 w-3.5 ap-heart-on" />
          Прозрачные пожертвования
        </span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight ap-on-dark sm:text-4xl">Помочь приютам</h2>
        <p className="mt-2 max-w-2xl text-base ap-on-dark-muted">
          Выберите приют и поддержите его любой суммой.
        </p>
        {/* Единственное подробное объяснение, как устроены деньги; в остальных местах — короткие подписи */}
        <div className="mt-6 flex max-w-3xl items-start gap-3 rounded-2xl ap-shelter-card p-5">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 ap-on-dark" />
          <div>
            <p className="text-base font-bold ap-on-dark">Как это устроено</p>
            <p className="mt-1 text-sm font-medium leading-relaxed ap-on-dark-muted">
              Вы переводите деньги через Kaspi прямо на реквизиты приюта — без комиссии и без нас посередине. AstanaPets платежи не принимает и не
              видит, а на что потрачены средства, приюты показывают в своих отчётах в Instagram.
            </p>
          </div>
        </div>
        {shelters.length === 0 && (
          <p className="mt-8 rounded-2xl ap-shelter-card p-5 text-sm font-semibold ap-on-dark-muted">
            Список приютов появится, как только загрузится каталог.
          </p>
        )}
        <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-center">
        <div className="grid flex-1 grid-cols-1 gap-5 sm:grid-cols-2">
          {shelters.map((s) => (
            <div
              key={s.shelter_name}
              className="ap-shelter-card flex flex-col gap-3 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-xl font-bold ap-on-dark tracking-tight">{quotedName(s.shelter_name)}</h3>
                  <p className="mt-1 text-sm font-semibold ap-on-dark-soft">
                    Ищут дом: <b className="font-bold ap-on-dark">{s.petsCount}</b> {pluralRu(s.petsCount, ['питомец', 'питомца', 'питомцев'])}
                  </p>
                </div>
                {s.shelter_verified && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full ap-badge-honey px-2.5 py-1 text-xs font-bold">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Проверен
                  </span>
                )}
              </div>
              {s.donation_usage && <p className="text-sm font-medium ap-on-dark-muted">{s.donation_usage}</p>}
              <button
                type="button"
                onClick={() => onDonate(null, s)}
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-2xl ap-btn-caramel px-4 py-3.5 text-sm font-bold transition-all duration-300 active:scale-95"
              >
                <Heart className="h-4 w-4" />
                Помочь приюту
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <HelpIllustration className="hidden w-80 shrink-0 lg:block" />
        </div>
      </div>
    </section>
  );
}

// Название в «ёлочках», если кавычек ещё нет: Я Живой → «Я Живой»
function quotedName(name) {
  const n = String(name ?? '').trim();
  return !n || /^[«"„“]/.test(n) ? n : `«${n}»`;
}

// Дружелюбная иллюстрация справа от карточек приютов: пёс и кот под сердечком
function HelpIllustration({ className = '' }) {
  const ink = '#283618';
  return (
    <svg viewBox="0 0 320 230" className={className} aria-hidden="true" focusable="false">
      {/* пунктирная тропинка из следов */}
      <path d="M8 196 C 40 150, 70 210, 60 150 S 20 90, 70 70" fill="none" stroke="#F0C48F" strokeOpacity="0.35" strokeWidth="2.5" strokeDasharray="2 9" strokeLinecap="round" />
      <ellipse cx="165" cy="212" rx="118" ry="9" fill="#000" opacity="0.18" />

      {/* сердечки */}
      <g className="ap-float-slow">
        <path d="M165 72 C 150 60, 136 48, 146 36 C 153 28, 162 32, 165 40 C 168 32, 177 28, 184 36 C 194 48, 180 60, 165 72 Z" fill="#E76F51" />
        <path d="M152 40 q4 -5 9 -3" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <path className="ap-float" d="M118 46 c-5 -4 -9 -8 -6 -11 c2 -2 5 -1 6 1 c1 -2 4 -3 6 -1 c3 3 -1 7 -6 11 z" fill="#DDA15E" />
      <path className="ap-float-late" d="M214 30 c-5 -4 -9 -8 -6 -11 c2 -2 5 -1 6 1 c1 -2 4 -3 6 -1 c3 3 -1 7 -6 11 z" fill="#F0C48F" />
      <circle cx="248" cy="62" r="2.5" fill="#F0C48F" opacity="0.7" />
      <circle cx="92" cy="30" r="2" fill="#F0C48F" opacity="0.6" />

      {/* пёс */}
      <path d="M66 172 C 44 166, 40 144, 50 132" fill="none" stroke="#DDA15E" strokeWidth="10" strokeLinecap="round" />
      <ellipse cx="108" cy="166" rx="44" ry="42" fill="#DDA15E" />
      <ellipse cx="114" cy="172" rx="21" ry="28" fill="#F0C48F" />
      <rect x="93" y="186" width="15" height="24" rx="7.5" fill="#DDA15E" />
      <rect x="118" y="186" width="15" height="24" rx="7.5" fill="#DDA15E" />
      <ellipse cx="100.5" cy="208" rx="9" ry="5" fill="#F0C48F" />
      <ellipse cx="125.5" cy="208" rx="9" ry="5" fill="#F0C48F" />
      <circle cx="114" cy="110" r="34" fill="#DDA15E" />
      <path d="M86 92 C 68 94, 64 126, 77 134 C 86 128, 90 112, 93 99 Z" fill="#BC6C25" />
      <path d="M142 92 C 160 94, 164 126, 151 134 C 142 128, 138 112, 135 99 Z" fill="#BC6C25" />
      <ellipse cx="114" cy="124" rx="16" ry="12" fill="#F0C48F" />
      <circle cx="101" cy="105" r="4" fill={ink} />
      <circle cx="127" cy="105" r="4" fill={ink} />
      <circle cx="102.3" cy="103.6" r="1.3" fill="#fff" />
      <circle cx="128.3" cy="103.6" r="1.3" fill="#fff" />
      <ellipse cx="114" cy="117" rx="5.5" ry="4" fill={ink} />
      <ellipse cx="115" cy="132" rx="3.5" ry="4.5" fill="#E76F51" />
      <path d="M114 121 v5 M107 127 q7 5 14 0" fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round" />

      {/* кот */}
      <path d="M248 196 C 286 192, 292 154, 270 142" fill="none" stroke="#FEFAE0" strokeWidth="10" strokeLinecap="round" />
      <ellipse cx="222" cy="170" rx="35" ry="38" fill="#FEFAE0" />
      <ellipse cx="222" cy="178" rx="17" ry="22" fill="#F7EBCB" />
      <rect x="206" y="190" width="13" height="20" rx="6.5" fill="#FEFAE0" />
      <rect x="226" y="190" width="13" height="20" rx="6.5" fill="#FEFAE0" />
      <path d="M197 112 L 199 80 L 218 97 Z" fill="#FEFAE0" />
      <path d="M245 112 L 243 80 L 224 97 Z" fill="#FEFAE0" />
      <path d="M202 102 L 203 88 L 212 96 Z" fill="#F0C48F" />
      <path d="M240 102 L 239 88 L 230 96 Z" fill="#F0C48F" />
      <circle cx="221" cy="121" r="28" fill="#FEFAE0" />
      <path d="M207 119 q5 -6 10 0 M225 119 q5 -6 10 0" fill="none" stroke={ink} strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="205" cy="131" r="4.5" fill="#E76F51" opacity="0.35" />
      <circle cx="237" cy="131" r="4.5" fill="#E76F51" opacity="0.35" />
      <path d="M217 126 h8 l-4 4 z" fill="#E76F51" />
      <path d="M221 130 q-3 4 -7 2 M221 130 q3 4 7 2" fill="none" stroke={ink} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M196 127 h-12 M197 132 l-11 3 M246 127 h12 M245 132 l11 3" stroke={ink} strokeOpacity="0.45" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Частые вопросы: тексты можно править прямо здесь
const FAQ_ITEMS = [
  {
    q: 'Сколько стоит забрать питомца?',
    a: 'AstanaPets не берёт денег ни за просмотр анкет, ни за контакты кураторов. Условия передачи (договор, расходы на прививки или стерилизацию) у каждого приюта свои: уточните их у куратора до встречи.',
  },
  {
    q: 'Как забрать питомца?',
    a: 'Откройте анкету и нажмите «Показать контакты куратора» — можно сразу написать в WhatsApp. Дальше договоритесь о знакомстве в приюте, а если всё сложится — оформите передачу и регистрацию чипа на себя.',
  },
  {
    q: 'Зачем чип и регистрация?',
    a: 'По правилам ответственного обращения с животными в РК питомец должен быть идентифицирован (чип) и зарегистрирован на владельца. Если питомец ещё не чипирован, это делают при передаче — в анкете так и отмечено.',
  },
  {
    q: 'Куда идут пожертвования?',
    a: 'Напрямую приюту — через Kaspi по ссылке или номеру куратора. На что тратятся средства, написано в карточке приюта, а отчёты приюты публикуют в своём Instagram.',
  },
  {
    q: 'Что значит «Проверен»?',
    a: 'Эту отметку получают приюты, с которыми мы связались лично и сверили контакты кураторов и реквизиты для пожертвований.',
  },
  {
    q: 'Не готов забрать, но хочу помочь. Что можно сделать?',
    a: 'Переведите любую сумму в разделе «Помочь приютам». Ещё можно рассказать о питомце друзьям или спросить куратора о волонтёрстве и передержке.',
  },
  {
    q: 'Питомец уже нашёл дом, а анкета ещё на сайте?',
    a: 'Каталог обновляется, как только приют отмечает изменения в своей таблице. Если анкета устарела, куратор подскажет — или напишите автору проекта в Telegram.',
  },
  {
    q: 'Я из приюта. Как добавить наших животных?',
    a: 'Напишите автору проекта в Telegram — расскажем, как подключиться. Сейчас подключение бесплатное.',
  },
];

function FaqItem({ item, open, onToggle, id }) {
  return (
    <div className="ap-card overflow-hidden rounded-2xl border">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={id}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-bold ap-text-main"
        >
          {item.q}
          <ChevronDown className={`h-5 w-5 shrink-0 ap-text-faint transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        </button>
      </h3>
      <div id={id} className={`ap-collapse ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <div>
          <p className="px-5 pb-5 text-sm font-medium leading-relaxed ap-text-muted">{item.a}</p>
        </div>
      </div>
    </div>
  );
}

function FaqSection() {
  const [openIndex, setOpenIndex] = useState(-1); // все вопросы свёрнуты по умолчанию
  return (
    <section id="faq" className="ap-cream-block scroll-mt-20 border-t ap-line">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <span className="inline-flex items-center gap-1.5 rounded-full ap-sand-deep px-3 py-1 text-xs font-bold ap-text-strong">
          <HelpCircle className="h-3.5 w-3.5" />
          FAQ
        </span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight ap-text-main sm:text-4xl">Частые вопросы</h2>
        {/* Два независимых столбца: раскрытый вопрос не растягивает соседний */}
        <div className="mt-8 grid gap-3 md:grid-cols-2 md:gap-4">
          {[FAQ_ITEMS.slice(0, Math.ceil(FAQ_ITEMS.length / 2)), FAQ_ITEMS.slice(Math.ceil(FAQ_ITEMS.length / 2))].map((column, c) => (
            <div key={c} className="flex flex-col gap-3 md:gap-4">
              {column.map((item) => {
                const i = FAQ_ITEMS.indexOf(item);
                return (
                  <FaqItem
                    key={item.q}
                    id={`faq-${i}`}
                    item={item}
                    open={openIndex === i}
                    onToggle={() => {
                      setOpenIndex(openIndex === i ? -1 : i);
                      if (openIndex !== i) trackEvent('faq_opened', { question: item.q });
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-col items-start gap-4 rounded-2xl border ap-line ap-paper p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-4">
            <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl ap-btn-telegram sm:inline-flex">
              <BrandIcon src={TELEGRAM_ICON_SRC} fallback={Send} className="h-5 w-5" />
            </span>
            <div>
              <p className="text-base font-bold leading-snug ap-text-main">Остались вопросы, есть предложения или хотите добавить приют?</p>
              <p className="mt-1 text-sm font-medium ap-text-muted">
                Свяжитесь с автором проекта в Telegram — <span className="font-semibold ap-text-strong">@{AUTHOR_TELEGRAM_USERNAME}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={openAuthorTelegram}
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl ap-btn-telegram px-5 py-3.5 text-base font-bold transition-all duration-300 active:scale-95 sm:w-auto"
          >
            <BrandIcon src={TELEGRAM_ICON_SRC} fallback={Send} className="h-5 w-5" />
            Написать в Telegram
          </button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="ap-footer overflow-hidden">
      <div className="relative mx-auto max-w-6xl space-y-4 px-4 py-10 md:pr-72">
        {/* Полупрозрачная лапа из логотипа справа */}
        <svg
          viewBox="7 8 34 34"
          className="ap-footer-paw pointer-events-none absolute right-4 top-1/2 hidden h-64 w-64 -translate-y-1/2 -rotate-12 md:block"
          aria-hidden="true"
        >
          <PawShape />
        </svg>
        <div className="flex items-center gap-2.5">
          <AppLogo className="h-9 w-9" />
          <span className="text-lg font-bold ap-text-main">Лапки Астаны · AstanaPets</span>
        </div>
        {/* О проекте (формулировки — о текущем положении дел, без обещаний «навсегда») */}
        <div className="max-w-3xl">
          <p className="text-base font-bold ap-text-main">Сделано на чистом энтузиазме</p>
          <p className="mt-1.5 text-sm font-medium leading-relaxed ap-text-muted">
            AstanaPets — информационный сервис: мы собираем анкеты питомцев из проверенных приютов Астаны в одном месте, чтобы им было проще найти
            дом. Мы не берём денег ни с тех, кто ищет питомца, ни с приютов. Мы не приют и не посредник, поэтому обо всём, что касается передачи, вы
            договариваетесь с куратором.
          </p>
        </div>
        <p className="text-xs font-semibold ap-text-faint">© {new Date().getFullYear()} AstanaPets · Пилотный проект · Астана, Казахстан</p>
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
  const [dataStatus, setDataStatus] = useState('ok'); // 'ok' | 'empty' | 'error'
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [activePet, setActivePet] = useState(null);
  const [donateTarget, setDonateTarget] = useState(null);
  const [toast, setToast] = useState('');
  const [favorites, setFavorites] = useState(loadFavorites);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(loadTheme);
  const [thanksTarget, setThanksTarget] = useState(null);

  // Демо: вымышленные контакты не открываем (это могут быть чужие реальные номера), показываем подсказку
  useEffect(() => {
    if (!DEMO_BUILD) return undefined;
    const guard = (e) => {
      const link = e.target.closest?.('a[href^="https://wa.me"], a[href^="tel:"], a[href*="kaspi"], a[href*="instagram.com"]');
      if (!link) return;
      e.preventDefault();
      e.stopPropagation();
      setToast('Это демо-версия: здесь откроются контакты или Kaspi вашего приюта');
    };
    document.addEventListener('click', guard, true);
    return () => document.removeEventListener('click', guard, true);
  }, []);
  const paymentIntentRef = useRef(null);

  // Человек нажал «Оплатить через Kaspi Pay» или скопировал номер → ушёл в Kaspi → вернулся на вкладку:
  // показываем благодарность (не чаще раза за визит). Оплату мы не видим, это только мягкое «спасибо».
  useEffect(() => {
    const THANKS_KEY = 'astanapets:thanks-shown';
    const onVisible = () => {
      if (document.visibilityState !== 'visible' || !paymentIntentRef.current) return;
      let shown = false;
      try {
        shown = sessionStorage.getItem(THANKS_KEY) === '1';
      } catch {
        shown = false;
      }
      const target = paymentIntentRef.current;
      paymentIntentRef.current = null;
      if (shown) return;
      try {
        sessionStorage.setItem(THANKS_KEY, '1');
      } catch {
        /* без sessionStorage просто покажем ещё раз в следующий визит */
      }
      setDonateTarget(null);
      setThanksTarget(target);
      trackEvent('thanks_shown', { shelter: target.shelter?.shelter_name });
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  // Тема: сохраняем выбор и красим фон страницы под ней (видно при «перетягивании» экрана)
  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch (_) {
      /* хранилище недоступно — тема живёт до перезагрузки */
    }
    document.documentElement.style.colorScheme = theme;
    document.body.style.backgroundColor = theme === 'dark' ? '#1A1917' : '#F3F1ED';
  }, [theme]);

  const changeTheme = (next) => {
    if (next === theme) return;
    setTheme(next);
    trackEvent('theme_changed', { theme: next });
  };

  const openMenu = () => {
    setMenuOpen(true);
    trackEvent('menu_opened');
  };
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    let alive = true;
    fetchData()
      .then(({ pets: petRows, shelters: sheltersFromSheet, source, via, status }) => {
        if (!alive) return;
        setPets(petRows.map(normalizePet));
        setShelterRows(sheltersFromSheet ? sheltersFromSheet.map(normalizeShelter) : null);
        setDataStatus(status);
        if (status === 'error') trackEvent('catalog_load_failed', { reason: 'no_data_no_cache' });
        if (source === 'cache') trackEvent('catalog_loaded_from_cache');
        if (source === 'snapshot') trackEvent('catalog_loaded_from_snapshot');
        if (via === 'google') trackEvent('catalog_loaded_via_google'); // opensheet не ответил — сработал запасной путь
      })
      .catch((e) => {
        console.error('Не удалось загрузить данные', e);
        if (alive) setDataStatus('error');
      })
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

  // Приюты с явным shelter_verified = FALSE прячем полностью: и карточку, и все их анкеты
  const hiddenShelterKeys = useMemo(() => {
    const set = new Set();
    (shelterRows || []).forEach((sh) => {
      if (sh.shelter_hidden) set.add(shelterKey(sh.shelter_name));
    });
    return set;
  }, [shelterRows]);

  const availablePets = useMemo(
    () => pets.filter((p) => (!p.status || p.status === 'available') && !hiddenShelterKeys.has(shelterKey(p.shelter_name))),
    [pets, hiddenShelterKeys]
  );

  // Ссылка вида ?pet=pet-536: после загрузки каталога сразу открываем эту анкету
  const deepLinkHandled = useRef(false);
  useEffect(() => {
    if (deepLinkHandled.current || loading) return;
    deepLinkHandled.current = true;
    const id = readPetParam();
    if (!id) return;
    const pet = availablePets.find((p) => String(p.id) === id);
    if (pet) {
      setActivePet(pet);
      trackEvent('pet_link_opened', { pet_id: pet.id, pet_name: pet.name, shelter: pet.shelter_name });
    } else {
      syncPetParam(null); // анкеты уже нет (например, питомца забрали) — просто показываем каталог
    }
  }, [loading, availablePets]);

  // Открытая анкета отражается в адресе, чтобы ссылку можно было скопировать прямо из браузера
  useEffect(() => {
    if (!deepLinkHandled.current) return;
    syncPetParam(activePet ? activePet.id : null);
  }, [activePet]);
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
      return shelterRows
        .filter((sh) => !sh.shelter_hidden)
        .map((sh) => ({ ...sh, petsCount: counts.get(shelterKey(sh.shelter_name)) || 0 }));
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
    <div className={`ap-root ap-clip-x w-full min-h-screen ap-text-main antialiased ${theme === 'dark' ? 'ap-dark' : ''}`}>
      <GlobalStyles />
      {DEMO_BUILD && <DemoBanner />}
      <Header favoritesCount={favorites.length} favoritesOnly={favoritesOnly} onToggleFavorites={toggleFavoritesView} onOpenMenu={openMenu} />
      <main>
        <Hero petsCount={availablePets.length} sheltersCount={activeSheltersCount} previewPets={availablePets} onOpenPet={openPet} />

        <section id="catalog" className="ap-catalog-block scroll-mt-20 border-b ap-line">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-3xl font-bold tracking-tight ap-text-main sm:text-4xl">Каталог питомцев</h2>
              {favoritesOnly && (
                <button
                  type="button"
                  onClick={toggleFavoritesView}
                  className="inline-flex items-center gap-1.5 rounded-full border-2 ap-chip-active px-4 py-2 text-sm font-bold transition-all duration-300"
                >
                  <Heart className="h-4 w-4 ap-fill-ivory" />
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
              ) : dataStatus === 'error' ? (
                <div className="ap-card rounded-3xl p-8 text-center sm:p-10" role="alert">
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
                    <AlertTriangle className="h-8 w-8 text-rose-600" />
                  </span>
                  <p className="mx-auto mt-4 max-w-md text-lg font-bold ap-text-main">
                    Не удалось загрузить каталог питомцев. Проверьте интернет или обновите страницу
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      trackEvent('catalog_reload_clicked');
                      window.location.reload();
                    }}
                    className="mt-6 inline-flex items-center gap-2 rounded-2xl ap-btn-accent px-7 py-4 text-base font-bold transition-all duration-300 active:scale-95"
                  >
                    <RefreshCw className="h-5 w-5" />
                    Обновить страницу
                  </button>
                </div>
              ) : dataStatus === 'empty' ? (
                <div className="ap-card rounded-3xl p-8 text-center sm:p-10">
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full ap-accent-soft">
                    <PawPrint className="h-8 w-8 ap-text-accent" />
                  </span>
                  <p className="mx-auto mt-4 max-w-md text-lg font-bold ap-text-main">
                    Сейчас все наши хвостики на проверке или уже нашли дом. Загляните чуть позже!
                  </p>
                </div>
              ) : shown.length === 0 ? (
                <div className="ap-card rounded-3xl border-2 border-dashed ap-line p-10 text-center">
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full ap-accent-soft">
                    {favoritesOnly ? <Heart className="h-8 w-8 ap-text-accent" /> : <PawPrint className="h-8 w-8 ap-text-accent" />}
                  </span>
                  <p className="mt-4 text-lg font-bold ap-text-main">
                    {favoritesOnly ? 'В избранном пока пусто' : 'Никого не нашли по этим фильтрам'}
                  </p>
                  <p className="mt-1 text-sm font-medium ap-text-soft">
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
                // Ряды-карусели по CAROUSEL_ROW_SIZE анкет: 7-я и дальше переезжают в следующий ряд
                <div className="space-y-8">
                  {chunk(shown, CAROUSEL_ROW_SIZE).map((row, i) => (
                    <PetCarousel key={i} resetKey={JSON.stringify(filters) + favoritesOnly}>
                      {row.map((pet) => (
                        <PetCard
                          key={pet.id}
                          pet={pet}
                          onOpen={openPet}
                          onDonate={openDonate}
                          isFavorite={favorites.includes(pet.id)}
                          onToggleFavorite={toggleFavorite}
                        />
                      ))}
                    </PetCarousel>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <SheltersSection shelters={shelters} onDonate={openDonate} />
        <FaqSection />
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
      <DonateModal
        target={donateTarget}
        onClose={() => setDonateTarget(null)}
        notify={setToast}
        onPaymentIntent={(t) => {
          paymentIntentRef.current = t;
        }}
      />
      <ThanksModal target={thanksTarget} onClose={() => setThanksTarget(null)} notify={setToast} />
      <SideDrawer open={menuOpen} onClose={closeMenu} theme={theme} onThemeChange={changeTheme} />
      <Toast message={toast} />
    </div>
  );
}
