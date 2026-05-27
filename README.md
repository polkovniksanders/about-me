# Personal Landing Page — Вячеслав Попов

Персональный лендинг fullstack-разработчика. Vanilla TypeScript + SCSS + Vercel Serverless Functions.

## Как запустить проект

### Требования

- Node.js 20+
- Vercel CLI: `npm i -g vercel`

### Локально

```bash
# 1. Установить зависимости
npm install

# 2. Скопировать и заполнить переменные окружения
cp .env.example .env.local

# 3. Связать с Vercel проектом (один раз)
vercel link

# 4. Запустить frontend + API одновременно
npm run dev:all
# Vite frontend: http://localhost:5173
# Vercel API:    http://localhost:3001
```

Для работы только с frontend (без API):

```bash
npm run dev
```

### Продакшн (автодеплой)

```bash
git push origin main   # Vercel автоматически деплоит из GitHub
```

Ручной деплой:

```bash
vercel deploy --prod
```

### Тесты

```bash
npm test          # запустить тесты один раз
npm run test:watch  # watch mode
```

### Сборка

```bash
npm run build     # tsc --noEmit + vite build
```

---

## Стек

| Слой | Технология |
|------|-----------|
| HTML | HTML5, семантическая вёрстка |
| Стили | SCSS (BEM), CSS Custom Properties |
| Логика | TypeScript (vanilla, без фреймворка) |
| Сборка | Vite 6 |
| Backend | Node.js, Vercel Serverless Functions |
| Email | Resend SDK |
| Тесты | Vitest |
| Деплой | Vercel (Hobby) |

**Почему vanilla TypeScript, а не React?**  
Лендинг — одна страница без компонентного дерева, роутинга и реактивного стейта. Framework добавил бы 40–80 KB runtime и сложность без пользы. Vanilla TS — технически правильный выбор для данного объёма.

---

## Как реализована форма

### Frontend (`src/ts/form.ts`)

- **Validators map** — типизирован как `Record<FieldName, ...>`, не `switch(name: string)`. TypeScript гарантирует покрытие всех полей.
- **State machine** через `data-state` атрибут на `<form>` — CSS управляет видимостью всех состояний через один атрибут, не через набор классов.
- **AbortController** + timeout 10s — форма не зависает при медленном соединении.
- **Type guards** вместо `as`-кастов для API response (`isApiSuccessResponse`, `isApiErrorResponse`).
- **INP оптимизация**: перед fetch делается `await setTimeout(0)` — браузер отрисовывает loading state до начала сетевого запроса.

### Shared типы (`src/ts/types.ts`)

Импортируется в `api/send-email.ts` — compile-time контракт между frontend и backend.

### Backend (`api/send-email.ts`)

Security middleware chain в порядке выполнения:

1. **CORS** — whitelist по `ALLOWED_ORIGIN`, обработка OPTIONS preflight
2. **Method check** — только POST, 405 иначе
3. **Content-Type enforcement** — предотвращает simple-request CORS bypass
4. **Body size limit** — 10 KB максимум
5. **Валидация** — server-side (не доверяем клиенту)
6. **Honeypot** — CSS off-screen поле `website`, silent 200 при заполнении
7. **Timing check** — < 3 сек → бот, > 1 час → устаревшая форма
8. **Rate limiting** — in-memory 1 req/min/IP (resets on cold start — known limitation)
9. **Resend** — два письма: владельцу (critical) + авто-ответ пользователю (non-critical)
10. **Email header injection prevention** — `sanitizeHeader()` на Subject строке
11. **Авто-ответ** — только fixed template, не отражает user input (защита от relay abuse)

**Rate limiting**: In-memory реализация сбрасывается при cold start serverless функции — это known limitation для personal portfolio. Для production: заменить на `@upstash/ratelimit` с Upstash Redis.

---

## Структура проекта

```
about-me/
├── src/
│   ├── index.html
│   ├── styles/
│   │   ├── main.scss              # только @use импорты
│   │   ├── _variables.scss        # CSS custom props + SCSS breakpoints
│   │   ├── _reset.scss
│   │   ├── _typography.scss       # self-hosted шрифты
│   │   ├── _layout.scss
│   │   ├── _components.scss       # btn, stack, timeline, case-card
│   │   ├── _sections.scss         # nav, hero, about, approach, cases, contacts
│   │   ├── _form.scss             # form + data-state CSS
│   │   └── _animations.scss       # [data-animate] scroll reveal
│   └── ts/
│       ├── types.ts               # shared types (frontend + API)
│       ├── main.ts                # lazy-load entry point
│       ├── form.ts                # validators, state machine, fetch
│       ├── animations.ts          # Intersection Observer, scroll-spy
│       └── __tests__/
│           └── form.test.ts       # 20 unit тестов validateField
├── api/
│   └── send-email.ts              # Vercel serverless function
├── vercel.json                    # build config + cache headers + framework: null
├── tsconfig.json                  # moduleResolution: bundler (важно для Vite)
├── tsconfig.api.json              # CommonJS target для api/
├── vite.config.ts                 # proxy /api → localhost:3001
└── vitest.config.ts
```

---

## Переменные окружения

| Переменная | Описание |
|-----------|----------|
| `RESEND_API_KEY` | API ключ Resend (resend.com) |
| `OWNER_EMAIL` | Email владельца для входящих заявок |
| `FROM_EMAIL` | Верифицированный sender в Resend |
| `ALLOWED_ORIGIN` | CORS whitelist (production URL) |

Заполнить в `.env.local` (локально) и в Vercel Dashboard (продакшн).

---

## AI-инструменты

- **Claude Code (Anthropic)** — основной инструмент разработки
  - `/compound-engineering:workflows:plan` — создание архитектурного плана
  - `/compound-engineering:deepen-plan` — углубление плана через 8 параллельных research-агентов
  - `/compound-engineering:workflows:work` — реализация по плану

---

## Что делалось с AI

- Создание архитектурного плана с исследованием best practices (TypeScript patterns, security, performance, design)
- Генерация конфигурационных файлов: `tsconfig.json`, `vite.config.ts`, `vercel.json`
- Структура SCSS-системы (переменные, компоненты, секции)
- Скелет TypeScript модулей (`types.ts`, `form.ts`, `animations.ts`)
- Serverless функция с security middleware chain
- Написание unit тестов для `validateField`
- HTML-структура с семантической вёрсткой

## Что правилось вручную

- Контент секций (биография, описания проектов, хронология опыта)
- CSS-детали дизайна (spacing, keyframe animations, hover states)
- Email-шаблоны (HTML письма)
- Настройка `.env.local` и Vercel Dashboard
- [Дополнить после запуска: что конкретно потребовало ручной правки]

---

## Известные ограничения

- **Rate limiting**: In-memory, сбрасывается при cold start. Для high-traffic: мигрировать на Upstash Redis.
- **Resend**: Требует верифицированный домен для `FROM_EMAIL`. Бесплатный план: 3000 писем/месяц.
- **Шрифты**: Файлы `inter-400.woff2`, `inter-600.woff2`, `jetbrains-mono-400.woff2` нужно скачать и положить в `src/assets/fonts/`. Инструкция: [rsms.me/inter](https://rsms.me/inter) и [jetbrains.com/lp/mono](https://www.jetbrains.com/lp/mono/).
