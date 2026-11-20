# Лапки Астаны · AstanaPets — памятка для Claude

Каталог кошек и собак из проверенных приютов Астаны + прозрачные пожертвования через Kaspi.
Владелец проекта общается по-русски, присылает скриншоты с iPad/ПК; отвечать по-русски, коротко, со скриншотами результата.

## Стек и где что лежит

- Vite + React 18 + Tailwind CSS v4 + lucide-react. Почти весь сайт — `src/App.jsx` (компоненты, стили в `GLOBAL_CSS`, тестовые `MOCK_PETS`).
- `src/sheetSource.js` — загрузка Google Таблицы (`SHEET_ID`): сначала opensheet.elk.sh, при сбое — Google напрямую (gviz).
- `scripts/snapshot-catalog.mjs` — при `npm run build` сохраняет таблицу в `public/data/catalog.json` (в git не хранится).
  Сайт берёт снимок или кэш браузера (что свежее), только если таблица недоступна совсем.
- `src/demoConfig.js` — `DEMO_BUILD`: в `main` и рабочей ветке `false`, в ветке `demo` — `true`.
- `.github/workflows/refresh-catalog.yml` — раз в сутки дёргает Vercel Deploy Hook (секрет `VERCEL_DEPLOY_HOOK`), чтобы обновить снимок.
- Шрифт один — Rubik (в нём есть кириллица, латиница, цифры и ₸). Не возвращать Plus Jakarta Sans.

## Данные (Google Таблица)

- Лист `pets`: `id`, `status` (`available` — показывать), `name`, `species` (dog/cat), `sex` (male/female), `age_months`, `size`
  (small/medium/large, синонимы вроде big понимаются), `photo_url` (несколько через `|`, Cloudinary), `description`,
  `character_tags` (через `|`, порядок = важность), `shelter_name`, контакты куратора, булевы TRUE/FALSE, совместимость YES/NO/UNKNOWN,
  `fundraising_goal_kzt` / `fundraising_collected_kzt` / `fundraising_purpose`, `created_at`.
- Лист `shelters`: реквизиты и контакты приюта; поля из него перекрывают строки питомцев (см. `mergePetWithShelter`).
- WhatsApp: если `curator_whatsapp` пуст — берётся `curator_phone`; номер нормализуется (8… → 7…).
- Таблица открыта «всем по ссылке» — любой с её ID видит ВСЕ листы и столбцы. Внутренние данные туда не класть.

## Ветки, деплой и правила работы

| Ветка | Vercel | Назначение |
|---|---|---|
| `main` | проект `astanapets` → https://astanapets.vercel.app | боевой сайт |
| `claude/intelligent-edison-gs6mb9` (рабочая) | preview (закрыт логином Vercel) | вся разработка |
| `demo` | отдельный проект `lapki-demo` (Production Branch = demo) → https://lapki-demo.vercel.app | эталон для приютов: тестовые питомцы, плашка «Демо-версия», контакты не открываются, без Метрики |

- Всё делаем и коммитим в рабочую ветку, проверяем `npm run build` и скриншотами (Playwright), пушим рабочую ветку.
- В `main` — только после явного «пушь» владельца: `git fetch origin main && git merge-base --is-ancestor origin/main HEAD && git push origin HEAD:main` (fast-forward).
- «Обнови демо»: в ветке `demo` смёржить рабочую/`main`, сохранив `DEMO_BUILD = true` в `src/demoConfig.js` и отсутствие счётчика Метрики в `index.html`; проверить сборку и запушить `demo`.
- Тестовые данные (`MOCK_PETS`) показываются только на localhost/127.0.0.1 и в демо-режиме; на боевом сайте при сбое — ошибка или снимок, не моки.

## Проверка локально

- `npm install`, `npx vite --port 5179`, скриншоты через Playwright (Chromium предустановлен).
- Окружение облачной сессии `astanapets` пропускает только `docs.google.com` и `opensheet.elk.sh`; фото (Cloudinary, Unsplash) и vercel.app закрыты — на скриншотах вместо фото заглушки.
- Node-скрипт снимка в песочнице запускать с `NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt`.

## Аналитика

`trackEvent(name, payload)` → Яндекс Метрика (счётчик 114363784, `reachGoal`) и gtag, если есть. В демо события не отправляются.
Ключевые цели: `pet_card_opened`, `reveal_contacts_clicked`, `whatsapp_clicked`, `curator_phone_called`, `donate_modal_opened`,
`kaspi_link_clicked`, `kaspi_phone_copied`, `thanks_shown`, `pet_share_clicked`, `thanks_share_clicked`, `pet_link_opened`,
`faq_opened`, `catalog_loaded_via_google`, `catalog_loaded_from_snapshot`, `catalog_load_failed`.

## Вкусы владельца (что уже обсуждали)

- Не любит «ИИ-клише»: блоки из трёх карточек-аргументов, клише вроде «1 000 ₸ — корм на день», растянутые плашки с текстом по центру.
- Тексты — живые, без канцелярита; клички не склонять автоматически (писать «это Барон», а не «на Барон»).
- Карточка каталога лёгкая: фото, кличка, теги (плашки по ширине текста, без сбора — до 3 рядов, со сбором — 1 ряд и «+N»), мини-полоса сбора, кнопки «Подробнее» / «Помочь».
- Каталог — ряды-карусели по 6 анкет (видно по 3, листаются стрелками по бокам и свайпом); 7-я и дальше — в следующий ряд (`CAROUSEL_ROW_SIZE`).
- Окна и боковая панель: прокрутка фона заблокирована (iOS-safe), закрытие с анимацией.
- Формулировки о бесплатности — в настоящем времени («сейчас бесплатно»), без обещаний «навсегда».

## Отложенные идеи

- Плашка «Новенький/Новенькая» для анкет младше 14 дней (по `created_at`): коммит `f09bdc9`, откат `7f6d538`. Вернуть — `git revert 7f6d538`.
- Свой домен (например, lapki.kz), мониторинг UptimeRobot.
