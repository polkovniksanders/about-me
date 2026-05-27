---
title: "feat: Personal Landing Page for Vyacheslav Popov"
type: feat
status: completed
date: 2026-05-27
deepened: 2026-05-27
---

# feat: Personal Landing Page — Vyacheslav Popov

## Enhancement Summary

**Deepened:** 2026-05-27
**Agents used:** TypeScript reviewer, Security sentinel, Performance oracle, Frontend design, Deployment expert, Architecture reviewer, Feasibility guardian, Best practices researcher

### Ключевые улучшения
1. Полная система типов TypeScript — `types.ts` как единый источник правды, discriminated unions, type guards
2. Детальная безопасность API — rate limiting через Upstash Redis, санитизация HTML, email header injection prevention, Content-Type enforcement
3. Производительность — self-hosted шрифты, критический CSS, lazy-loading modules, `passive` scroll listeners, dark theme flash prevention
4. Дизайн-система — конкретная палитра (#0b0e14 + teal-cyan акцент), expo-out easing, CSS data-attribute state machine
5. Deployment — полный `vercel.json`, Vite proxy для локальной разработки, `tsc --noEmit` в build-скрипте

### Критические находки от ревью
- **Самый высокий риск:** Resend требует верифицированный домен — без домена auto-reply сломается. Fallback: Nodemailer + Gmail App Password.
- **Архитектурная правка:** `"moduleResolution": "bundler"` в tsconfig, не `"node"` — иначе Vite imports сломаются.
- **Пропущено в оригинале:** `tsc --noEmit` перед `vite build` (Vite игнорирует type errors!), Vitest для `validateField`, `vercel link` в README.
- **Упрощение:** Rate limiting in-memory достаточен для demo; Upstash — для продакшна.
- **Ошибка в acceptance criteria:** "4 секции" → должно быть "5 секций" (Hero + About + Approach + Cases + Contacts).

---

## Источник данных

Вся информация о владельце взята с: `https://slava.berghub.ru`

**Владелец:** Вячеслав Попов (Слава)
**Email для писем:** fit.tribes.fit@gmail.com
**Telegram:** @berghub
**Локация:** Россия
**Статус:** Открыт к коммерческим проектам

---

## Структура проекта

```
about-me/
├── src/
│   ├── index.html
│   ├── styles/
│   │   ├── main.scss              # только @use/@forward импорты, без правил
│   │   ├── _variables.scss        # CSS custom properties + SCSS переменные (breakpoints)
│   │   ├── _reset.scss            # normalize, box-sizing, base
│   │   ├── _typography.scss       # @font-face, headings, body, monospace
│   │   ├── _layout.scss           # container, grid, section spacing (не контент секций)
│   │   ├── _components.scss       # form, buttons, cards, tags — переиспользуемые
│   │   ├── _sections.scss         # hero, about, approach, cases, contacts — page-specific
│   │   ├── _animations.scss       # [data-animate] базовые состояния
│   │   └── _responsive.scss       # media queries (если не co-located)
│   ├── ts/
│   │   ├── types.ts               # НОВЫЙ — все типы, единый источник правды
│   │   ├── main.ts                # инициализация, bootstrap
│   │   ├── form.ts                # form logic, validation, state machine
│   │   └── animations.ts          # scroll animations, Intersection Observer
│   └── assets/
│       ├── icons/                 # SVG исходники для sprite
│       └── fonts/                 # self-hosted woff2
├── api/
│   └── send-email.ts              # Vercel serverless function
├── package.json
├── tsconfig.json
├── tsconfig.api.json              # НОВЫЙ — отдельный tsconfig для api/ (CommonJS target)
├── vite.config.ts
├── vercel.json
├── .env.example
├── .env.local                     # gitignored — реальные ключи
└── README.md
```

### Research Insights: Структура

**Best Practices:**
- Использовать `@use`/`@forward` вместо `@import` — `@import` deprecated в Dart Sass и будет удалён
- Папка `api/` требует отдельного `tsconfig.api.json` с `"module": "CommonJS"` — Vercel Node runtime vs Vite ESM разные окружения
- `types.ts` — не barrel export (не реэкспортирует модули), а типы-only файл. Критически важно импортировать в `api/send-email.ts` для compile-time контракта frontend ↔ API

```json
// tsconfig.api.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "node",
    "lib": ["ES2022"]
  },
  "include": ["api"]
}
```

---

## Секции лендинга

### 1. Hero / Header

- Имя: **Вячеслав Попов**
- Роль: Fullstack Engineer · Telegram Mini Apps · AI Integrations
- Пульсирующий pill "Открыт к проектам" над именем (accent цвет)
- Один метрик прямо в Hero: `-40% время операций`, `100% Lighthouse Performance`
- CTA-кнопка: "Написать мне" → плавный скролл к форме
- Фоновая grid-сетка (CSS `background-image: linear-gradient`) с mask-image radial-gradient

### Research Insights: Hero

**Что делает портфолио запоминающимся:**
- Specificity of identity, не визуальная сложность
- Нишевая специализация ("Telegram Mini Apps + AI") фильтрует клиентов сразу
- Метрики над fold — не в секции About
- Пульсирующий dot статуса "доступен" — без текста, через анимацию

**Избегать:**
- "Passionate developer" — у всех написано
- Typing animations на должности (overused с 2018)
- Profile photo в hexagon
- Full-viewport gradient blobs без информационной иерархии

### 2. Обо мне (`#about`)

**Стек** (визуализация: сгруппированные пилюли с border-left категорийной меткой):

- **Frontend:** React, Next.js, TypeScript, Redux Toolkit, Styled Components, Tailwind CSS, Ant Design, Webpack/Vite
- **Backend:** Node.js, Express, PostgreSQL, Prisma, WebSockets
- **Специализация:** Telegram Mini App SDK, AI (Anthropic Claude, OpenAI, HuggingFace), Docker, OSRM

**Опыт:**
- Фабрика ИТ (май 2023 – н.в.) — Fullstack developer; 100% Lighthouse Performance, -40% время операций клиентов
- Кит Актив (май 2019 – май 2023) — Frontend developer; TypeScript-миграция, культура code review
- Ранее: Marketing/SMM/Content (2011–2023)
- Итого: 6+ лет коммерческого опыта

**Направления:**
- Production-ready web-приложения
- Telegram Mini Apps (полный цикл)
- AI-интеграции в продукты
- Scalable архитектура (FSD, distributed systems)

### Research Insights: Стек визуализация

**Не использовать:** progress bars ("React: 87%" — бессмысленно), tag cloud из 20+ пилюль.

**Использовать:** сгруппированные карточки по домену с monospace label:

```scss
.stack__label {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-text-muted);
  padding-left: 0.75rem;
  border-left: 2px solid var(--color-accent);
}
```

### 3. Как я работаю (`#approach`)

**Подход к задачам:**
- Production-ready: безопасность (Helmet, rate limiting, JWT), тестирование (Jest, Testing Library)
- Масштабируемая архитектура (FSD-паттерн)
- Data-driven оптимизации
- Неформальное, прозрачное общение

**Как использую AI в работе:**
- Anthropic Claude, OpenAI API, HuggingFace с fallback-цепочками
- AI-чатботы, генерация контента, автоматизация рутинных процессов
- Осмысленная интеграция AI (не ради хайпа)
- Claude Code для планирования и реализации задач

### 4. Кейсы / опыт (`#cases`)

Асимметричная раскладка: 1 featured карточка (full-width) + 6 secondary в сетке.

| Проект | Описание |
|--------|----------|
| **Telegram Shops** *(featured)* | No-code платформа с AI-ассистентами для создания магазинов |
| **AI Chat** | Full-stack real-time чат с OpenAI + WebSocket |
| **WandaAsk** | HR-платформа с персонализированным AI и аналитическими дашбордами |
| **Intercity Taxi Bot** | Production Telegram-бот с distributed locks и BullMQ |
| **Степка** | AI-чатбот с характером и автоматизированным контентом |
| **Medical Equipment SaaS** | Multi-tenant SaaS; снижение простоев на 25–30% |
| **PersonaGen** | AI-генератор персонажей: LLM + синтез изображений |

### Research Insights: Cases layout

**Проблема 7 карточек:** на mobile — doom-scroll; на desktop — orphaned item в 3-column grid.

**Решение:** featured (colspan full) + 6 в сетке 2→3 колонки:

```scss
.cases__grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    .case-card:first-child { grid-column: 1 / -1; }
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    .case-card:first-child {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
  }
}
```

**Упрощение (совет от feasibility review):** Рассмотреть сокращение до 4–5 кейсов — оценивается качество кода, не количество карточек.

### 5. Контакты (`#contacts`)

- Telegram: @berghub
- Рабочая форма обратной связи (описана ниже)

---

## Форма обратной связи

### Поля формы
- **Имя** (text, required, min 2 символа)
- **Телефон** (tel, required, regex `^[+\d\s()\-]+$`, max 20)
- **Email** (email, required, валидация через regex + `validator.isEmail()`)
- **Комментарий** (textarea, required, min 10 символов, max 2000)
- **website** (honeypot, hidden via CSS, server-side silent reject)
- **_formLoadTime** (hidden, set by JS to Date.now() — timing anti-bot check)

### UX-состояния формы

Состояние управляется через `data-state` атрибут на контейнере формы (не toggle CSS классов):

```typescript
// Все DOM-мутации в одной функции
function renderFormState(state: FormState): void {
  formEl.dataset.state = state; // один атрибут → CSS делает остальное
  submitBtn.disabled = state === 'loading';
}
```

```scss
.form[data-state="loading"] .form__submit { opacity: 0.6; cursor: not-allowed; }
.form[data-state="success"] .form__feedback--success { display: block; }
.form[data-state="error"] .form__feedback--error { display: block; }
```

- `idle` — форма готова
- `loading` — spinner на кнопке, поля disabled
- `success` — зелёный баннер: "Сообщение отправлено! Ожидайте ответа."
- `error` — красный баннер + возможность повторить
- Inline-валидация при blur (не при input — агрессивно), исправление показывает ✓

**Зарезервировать height для error messages** — предотвращает CLS:
```scss
.form__error { min-height: 1.1em; } /* всегда занимает место, даже пустой */
```

### Типы (src/ts/types.ts)

```typescript
export type FormState = 'idle' | 'loading' | 'success' | 'error';

export interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  comment: string;
  honeypot: string;       // всегда пустой у реального пользователя
  _formLoadTime: string;  // timestamp для timing check
}

export interface ApiSuccessResponse { success: true; }
export interface ApiErrorResponse {
  success: false;
  error: string;
  field?: keyof Omit<ContactFormData, 'honeypot' | '_formLoadTime'>;
}
export type ApiResponse = ApiSuccessResponse | ApiErrorResponse;
export type FieldName = keyof Omit<ContactFormData, 'honeypot' | '_formLoadTime'>;
export type ValidationResult = string | null; // null = valid
```

### Логика валидации (src/ts/form.ts)

```typescript
// Validators map — type-safe, не switch(name: string)
const validators: Record<FieldName, (v: string) => ValidationResult> = {
  name:    (v) => v.trim().length >= 2 ? null : 'Имя: минимум 2 символа',
  phone:   (v) => /^[+\d\s()\-]+$/.test(v.trim()) ? null : 'Некорректный телефон',
  email:   (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Некорректный email',
  comment: (v) => v.trim().length >= 10 ? null : 'Комментарий: минимум 10 символов',
};

// validateAll перед submit — не только per-field blur
function validateAll(data: Omit<ContactFormData, 'honeypot' | '_formLoadTime'>):
  Partial<Record<FieldName, string>> {
  const errors: Partial<Record<FieldName, string>> = {};
  (Object.keys(validators) as FieldName[]).forEach(key => {
    const r = validators[key](data[key]);
    if (r !== null) errors[key] = r;
  });
  return errors;
}
```

### Fetch с AbortController (src/ts/form.ts)

```typescript
const SUBMIT_TIMEOUT_MS = 10_000;

async function postContactForm(data: ContactFormData): Promise<ApiResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);

  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    const json: unknown = await response.json();

    if (!response.ok) {
      return isApiErrorResponse(json) ? json
        : { success: false, error: `HTTP ${response.status}` };
    }
    return isApiSuccessResponse(json) ? json
      : { success: false, error: 'Unexpected response' };

  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError')
      return { success: false, error: 'Превышено время ожидания.' };
    return { success: false, error: 'Сетевая ошибка. Проверьте соединение.' };
  } finally {
    clearTimeout(timeoutId);
  }
}

// Type guards вместо as-casts
function isApiSuccessResponse(v: unknown): v is ApiSuccessResponse {
  return typeof v === 'object' && v !== null
    && (v as Record<string, unknown>)['success'] === true;
}
function isApiErrorResponse(v: unknown): v is ApiErrorResponse {
  return typeof v === 'object' && v !== null
    && (v as Record<string, unknown>)['success'] === false;
}
```

**INP-важно:** Перед async fetch — yield браузеру чтобы loading state успел отрисоваться:

```typescript
async function handleSubmit(e: SubmitEvent): Promise<void> {
  e.preventDefault();
  renderFormState('loading');
  await new Promise(resolve => setTimeout(resolve, 0)); // yield to paint
  const result = await postContactForm(formData);
  renderFormState(result.success ? 'success' : 'error');
}
```

---

## Backend / API

### Выбор: Vercel Serverless Functions (Node.js + TypeScript)

Файл: `api/send-email.ts`

**Провайдер отправки email:**
- **Primary:** [Resend](https://resend.com) — TypeScript SDK, 3000 писем/месяц бесплатно
  - ⚠️ **Риск:** требует верифицированный домен для отправки на чужой email
- **Fallback:** Nodemailer + Gmail SMTP App Password — работает без домена, 500 писем/день
  - Рекомендуется для MVP если нет кастомного домена

**Решение:** Начать с Nodemailer для MVP, мигрировать на Resend после получения домена. Абстрагировать за функцией `sendEmail()` — смена провайдера = один файл.

### Переменные окружения

```env
# .env.example (коммитится, без реальных значений)
RESEND_API_KEY=re_REPLACE_ME
OWNER_EMAIL=your@email.com
FROM_EMAIL=noreply@yourdomain.com
ALLOWED_ORIGIN=https://yourproject.vercel.app
UPSTASH_REDIS_REST_URL=https://REPLACE_ME.upstash.io
UPSTASH_REDIS_REST_TOKEN=REPLACE_ME

# Для Nodemailer fallback:
GMAIL_USER=your@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

### Логика API (api/send-email.ts)

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import type { ContactFormData } from '../src/ts/types'; // shared types!

// Env guard на старте модуля (не в handler)
const REQUIRED_ENV = ['RESEND_API_KEY', 'OWNER_EMAIL', 'FROM_EMAIL', 'ALLOWED_ORIGIN'];
REQUIRED_ENV.forEach(k => { if (!process.env[k]) throw new Error(`Missing env: ${k}`); });

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // 1. CORS (включая OPTIONS preflight)
  if (setCorsHeaders(req, res)) return;

  // 2. Method check
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ success: false, error: 'Method not allowed' }); return;
  }

  // 3. Content-Type (предотвращает simple-request CORS bypass)
  if (!(req.headers['content-type'] ?? '').includes('application/json')) {
    res.status(415).json({ success: false, error: 'Unsupported Media Type' }); return;
  }

  // 4. Body size limit
  if (JSON.stringify(req.body ?? {}).length > 10_000) {
    res.status(413).json({ success: false, error: 'Request too large' }); return;
  }

  // 5. Parse + validate
  const parsed = parseAndValidate(req.body);
  if (typeof parsed === 'string') {
    res.status(400).json({ success: false, error: parsed }); return;
  }

  // 6. Honeypot + timing check (silent success)
  if (parsed.honeypot || Date.now() - parseInt(parsed._formLoadTime) < 3000) {
    res.status(200).json({ success: true }); return;
  }

  // 7. Rate limiting
  const ip = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() || 'unknown';
  if (await isRateLimited(ip)) {
    res.status(429).json({ success: false, error: 'Слишком много запросов.' }); return;
  }

  // 8. Send emails (asymmetric error handling)
  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: process.env.OWNER_EMAIL!,
      replyTo: parsed.email,
      subject: `Новое сообщение с сайта от ${sanitizeHeader(parsed.name)}`,
      html: buildOwnerEmail(parsed),
    });
  } catch (err) {
    console.error('[send-email] owner notification failed:', err);
    res.status(500).json({ success: false, error: 'Не удалось отправить. Попробуйте позже.' }); return;
  }

  // Auto-reply — non-critical, log but don't fail
  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: parsed.email,
      subject: 'Сообщение получено',
      html: buildAutoReply(parsed.name), // ТОЛЬКО фиксированный текст, не user input!
    });
  } catch (err) {
    console.error('[send-email] auto-reply failed:', err);
  }

  res.status(200).json({ success: true });
}
```

### Безопасность API

#### Санитизация

```typescript
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}

function sanitizeHeader(value: string): string {
  return value.replace(/[\r\n\t]+/g, ' ').trim(); // email header injection prevention
}

function parseAndValidate(body: unknown): ContactFormData | string {
  if (typeof body !== 'object' || body === null) return 'Invalid body';
  const b = body as Record<string, unknown>;

  const name    = typeof b['name']    === 'string' ? b['name'].trim()    : '';
  const phone   = typeof b['phone']   === 'string' ? b['phone'].trim()   : '';
  const email   = typeof b['email']   === 'string' ? b['email'].trim()   : '';
  const comment = typeof b['comment'] === 'string' ? b['comment'].trim() : '';
  const honeypot = typeof b['honeypot'] === 'string' ? b['honeypot'] : '';
  const _formLoadTime = typeof b['_formLoadTime'] === 'string' ? b['_formLoadTime'] : '0';

  if (!name || name.length < 2 || name.length > 100)      return 'Invalid name';
  if (!email || email.length > 254 || /[\r\n]/.test(email)) return 'Invalid email';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))          return 'Invalid email';
  if (!phone || !/^[+\d\s()\-]+$/.test(phone))            return 'Invalid phone';
  if (!comment || comment.length < 10 || comment.length > 2000) return 'Invalid comment';

  return {
    name: escapeHtml(name), phone: escapeHtml(phone),
    email, comment: escapeHtml(comment), honeypot, _formLoadTime
  };
}
```

#### Rate Limiting

**Simple in-memory (достаточно для demo/MVP):**
```typescript
const submissionLog = new Map<string, number>();

async function isRateLimited(ip: string): Promise<boolean> {
  const now = Date.now();
  const last = submissionLog.get(ip) ?? 0;
  if (now - last < 60_000) return true; // 1 submit per minute per IP
  submissionLog.set(ip, now);
  return false;
}
```

**Production: Upstash Redis** (`@upstash/ratelimit` + sliding window 5 req/10 min).
Документировать в README — показывает понимание ограничений in-memory в serverless.

#### CORS

```typescript
function setCorsHeaders(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers['origin'] ?? '';
  const allowed = process.env.ALLOWED_ORIGIN!;

  if (origin === allowed) {
    res.setHeader('Access-Control-Allow-Origin', allowed);
    res.setHeader('Vary', 'Origin'); // required when not wildcard
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') { res.status(204).end(); return true; }
  return false;
}
```

#### Honeypot HTML

```html
<!-- Позиционировать off-screen — НЕ display:none (боты это видят) -->
<div class="form__honeypot" aria-hidden="true">
  <input type="text" name="website" tabindex="-1" autocomplete="off">
</div>
```
```scss
.form__honeypot {
  position: absolute;
  left: -9999px;
  width: 1px; height: 1px;
  overflow: hidden; opacity: 0; pointer-events: none;
}
```

---

## Технический стек

| Слой | Технология | Обоснование |
|------|-----------|-------------|
| Markup | HTML5 семантический | `<header>`, `<section>`, `<nav>`, `<footer>`, `<main>` |
| Стили | SCSS (BEM) + CSS custom properties | BEM для структуры; CSS vars для runtime/theme |
| Логика | TypeScript (vanilla) | Нет component tree, нет reactive state → framework лишний |
| Сборка | Vite 5.x | HMR, TS из коробки, ESM, быстрый |
| Backend | Node.js (Vercel Functions) | Serverless, бесплатно, TypeScript |
| Email | Resend / Nodemailer | Resend если есть домен; Nodemailer иначе |
| Тесты | Vitest | Нативен для Vite, быстрый, нулевой конфиг |
| Деплой | Vercel | Автодеплой из GitHub, serverless functions |

---

## Дизайн-система

### Цветовая палитра (CSS Custom Properties)

```css
:root {
  /* Фоны — хроматический near-black (синеватый тинт, не flat gray) */
  --color-bg-base:      #0b0e14;
  --color-bg-surface:   #111520;
  --color-bg-elevated:  #181e2d;
  --color-bg-overlay:   #1f2640;

  /* Границы */
  --color-border-subtle:  rgba(255, 255, 255, 0.06);
  --color-border-default: rgba(255, 255, 255, 0.10);
  --color-border-strong:  rgba(255, 255, 255, 0.18);

  /* Акцент — teal-cyan (не overused #3b82f6 blue) */
  --color-accent:      #4fd1c5;
  --color-accent-dim:  #2c9d94;
  --color-accent-ghost: rgba(79, 209, 197, 0.10);
  --color-accent-glow:  rgba(79, 209, 197, 0.20);

  /* Текст */
  --color-text-primary:   #e8edf5;
  --color-text-secondary: #8892a4;
  --color-text-muted:     #4a5568;

  /* Семантические */
  --color-success: #48bb78;
  --color-error:   #fc8181;

  /* Шрифты */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Типографика */
  --text-xs:   0.75rem;
  --text-sm:   0.875rem;
  --text-base: 1rem;
  --text-lg:   1.125rem;
  --text-xl:   1.25rem;
  --text-2xl:  1.5rem;
  --text-3xl:  1.875rem;
  --text-hero: clamp(2.5rem, 6vw, 4.5rem);

  /* Spacing scale */
  --space-4:  1rem;
  --space-6:  1.5rem;
  --space-8:  2rem;
  --space-12: 3rem;
  --section-padding-y: clamp(4rem, 8vw, 7rem);
  --container-max:     1200px;
  --container-padding: clamp(1rem, 4vw, 2rem);
}
```

### Шрифты — self-hosted (не Google Fonts)

Google Fonts: 2 дополнительных DNS lookup + внешний render-blocking stylesheet = -200-400ms на холодной загрузке. Self-hosting устраняет это:

```html
<!-- preload только используемые веса -->
<link rel="preload" href="/assets/fonts/inter-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/inter-600.woff2" as="font" type="font/woff2" crossorigin>
<!-- JetBrains Mono — НЕ preload, below the fold -->
```

```scss
@font-face {
  font-family: 'Inter';
  src: url('/assets/fonts/inter-400.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;       // show system font immediately
  unicode-range: U+0000-00FF, U+0400-04FF; // Latin + Cyrillic only
}
@font-face {
  font-family: 'JetBrains Mono';
  src: url('/assets/fonts/jetbrains-mono-400.woff2') format('woff2');
  font-weight: 400;
  font-display: optional;   // non-critical font — no CLS on first visit
}
```

### Dark Theme Flash Prevention

Blocking inline script в `<head>` ДО stylesheet:

```html
<script>
  (function() {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', stored || (prefersDark ? 'dark' : 'light'));
  })();
</script>
```

```scss
[data-theme="dark"] { /* CSS custom properties override */ }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { /* fallback если JS не запустился */ }
}
```

### Анимации

```typescript
// animations.ts — singleton observer, не per-element
export function initAnimations(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // fire once
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll<HTMLElement>('[data-animate]').forEach(el => observer.observe(el));
}
```

```scss
[data-animate] {
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 500ms cubic-bezier(0.16, 1, 0.3, 1), // expo-out — confident, not floaty
    transform 500ms cubic-bezier(0.16, 1, 0.3, 1);

  &.is-visible { opacity: 1; transform: translateY(0); }

  @media (prefers-reduced-motion: reduce) { opacity: 1; transform: none; transition: none; }
}
```

**`data-animate` vs class:** JS-хуки через `data-*` атрибуты — BEM классы для стилизации, не для JS. Это паттерн, который senior ревьюеры замечают.

---

## Конфигурационные файлы

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "exactOptionalPropertyTypes": true,
    "useUnknownInCatchVariables": true,
    "isolatedModules": true,
    "skipLibCheck": true
  },
  "include": ["src/ts"],
  "exclude": ["node_modules", "dist"]
}
```

**Критично:** `"moduleResolution": "bundler"` — не `"node"`. Для Vite это единственно правильный вариант. `"node"` тихо сломает ESM imports в некоторых средах.

### vite.config.ts

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: ['chrome96', 'firefox96', 'safari15'],
    assetsInlineLimit: 4096,
    cssCodeSplit: false,
    sourcemap: false,
  },
  css: {
    preprocessorOptions: { scss: { quietDeps: true } },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // vercel dev port
        changeOrigin: true,
      },
    },
  },
});
```

### vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": null,
  "functions": {
    "api/send-email.ts": {
      "runtime": "nodejs20.x",
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "no-store" }]
    }
  ]
}
```

**Критично:** `"framework": null` — иначе Vercel autodetects Next.js и сломает сборку.

### package.json scripts

```json
{
  "scripts": {
    "dev": "vite",
    "dev:api": "vercel dev --listen 3001",
    "dev:all": "concurrently \"npm run dev\" \"npm run dev:api\"",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src/ts api --ext .ts"
  }
}
```

**Критично:** `tsc --noEmit && vite build` — Vite транспилирует TS без проверки типов! Без `tsc --noEmit` type errors пройдут в деплой незамеченными.

---

## Тестирование

Vitest для `validateField` — чистая функция, нет DOM зависимостей:

```typescript
// src/ts/__tests__/form.test.ts
import { describe, it, expect } from 'vitest';
import { validateField } from '../form';

describe('validateField', () => {
  it('returns error for empty name', () => {
    expect(validateField('name', '')).toBeTruthy();
  });
  it('accepts valid name', () => {
    expect(validateField('name', 'Alice')).toBeNull();
  });
  it('rejects invalid email', () => {
    expect(validateField('email', 'not-email')).toBeTruthy();
  });
  it('accepts valid email', () => {
    expect(validateField('email', 'test@example.com')).toBeNull();
  });
  it('rejects short comment', () => {
    expect(validateField('comment', 'hi')).toBeTruthy();
  });
});
```

`validateField` должна быть экспортируемой чистой функцией без DOM зависимостей.

---

## Производительность — ключевые меры

| Мера | Метрика | Ожидаемый эффект |
|------|---------|-----------------|
| Self-host fonts + preload | LCP, CLS | +10-15 pts |
| `tsc --noEmit` в build | — | Поймать type errors до деплоя |
| Lazy-load form.ts + animations.ts | TBT | +8-12 pts |
| `font-display: optional` для JetBrains Mono | CLS | +5 pts |
| `passive: true` на scroll listeners | INP | +3-5 pts |
| Inline SVG sprite | FCP | +3-5 pts |
| Dark theme blocking script | CLS | +2-5 pts |
| `Cache-Control: immutable` на `/assets/*` | повторные визиты | значительный |

**SVG иконки — не icon fonts, не emoji:** inline SVG sprite через `<use href="#icon-name">` — нулевые HTTP requests, правильная доступность.

---

## Acceptance Criteria

### Frontend
- [ ] Все **5** секций реализованы с реальным контентом (Hero, About, Approach, Cases, Contacts)
- [ ] Форма имеет 4 поля + honeypot + timing field с клиентской валидацией
- [ ] Состояния формы управляются через `data-state` атрибут
- [ ] 4 UX состояния формы (idle/loading/success/error) визуально различимы
- [ ] Сайт корректно отображается на 320px, 768px, 1024px, 1440px
- [ ] Прошёл HTML validator (0 ошибок)
- [ ] Lighthouse Performance ≥ 90, Accessibility ≥ 90
- [ ] `prefers-reduced-motion` уважается в CSS и JS
- [ ] Нет layout shift от form validation messages (reserved height)

### TypeScript
- [ ] `types.ts` содержит все типы, импортируется и из frontend и из `api/`
- [ ] `validateField` принимает `FieldName` (не `string`)
- [ ] `postContactForm` использует `AbortController` + timeout
- [ ] Type guards вместо `as`-кастов для API response
- [ ] `tsconfig.json` с `"moduleResolution": "bundler"` и `strict: true`
- [ ] ESLint: `@typescript-eslint/no-explicit-any: "error"` (no any)
- [ ] Vitest тесты для `validateField` (минимум 5 тест-кейсов)

### Backend / API
- [ ] POST `/api/send-email` принимает и валидирует все поля server-side
- [ ] Content-Type enforcement (415 если не application/json)
- [ ] Body size limit check
- [ ] Honeypot + timing check (silent 200)
- [ ] Rate limiting (in-memory minimum)
- [ ] Письмо приходит владельцу (OWNER_EMAIL)
- [ ] Auto-reply пользователю (только fixed template, не user input)
- [ ] API возвращает понятные ошибки (400/413/415/429/500)
- [ ] CORS с whitelist (не `*`), включая OPTIONS preflight
- [ ] `sanitizeHeader()` на Subject line
- [ ] Env vars validated at module startup
- [ ] Локальный запуск через `vercel dev`

### Структура / Качество
- [ ] Проект запускается командами из README
- [ ] `.env.example` заполнен всеми переменными
- [ ] SCSS разбит по файлам с чёткими ответственностями
- [ ] Нет `@import` в SCSS — только `@use`/`@forward`
- [ ] `build` скрипт включает `tsc --noEmit`
- [ ] README содержит все требуемые разделы (включая AI disclosure)
- [ ] `vercel.json` с `"framework": null`

---

## README (обязательные разделы)

```markdown
# Personal Landing Page — Vyacheslav Popov

## Как запустить проект

### Требования
- Node.js 20+
- Vercel CLI (`npm i -g vercel`)

### Локально
npm install
cp .env.example .env.local   # заполнить ключи
vercel link                   # связать с Vercel проектом (нужно один раз)
npm run dev:all               # Vite :5173 + Vercel API :3001

### Только frontend (без API)
npm run dev

### Продакшн
git push origin main          # автодеплой через GitHub → Vercel

## Стек
- HTML5 + SCSS (BEM methodology, CSS custom properties)
- TypeScript (vanilla, без фреймворка) + Vite 5
- Node.js (Vercel Serverless Functions)
- Resend / Nodemailer (email delivery)
- Vitest (unit tests)

## Как реализована форма

Клиент: валидация через validators map (`FieldName` типы, не `string`).
Состояние через `data-state` атрибут на форме.
Fetch через AbortController с timeout 10s.

Сервер (api/send-email.ts):
1. CORS с whitelist + OPTIONS preflight
2. Content-Type enforcement
3. Body size limit
4. Honeypot + timing check
5. Server-side re-validation (не доверяем клиенту)
6. Rate limiting (in-memory; Upstash Redis для production)
7. sanitizeHeader() на Subject
8. Resend: 2 письма (владельцу + автоответ)

Shared types: src/ts/types.ts импортируется из обоих — compile-time контракт.

## AI-инструменты

- **Claude Code (Anthropic)** — планирование архитектуры через /workflows:plan,
  углубление плана через /deepen-plan (8 параллельных research-агентов),
  генерация кода по плану

## Что делалось с AI
- Создание плана проекта и исследование best practices
- Генерация tsconfig, vercel.json, vite.config конфигураций
- Скелет serverless функции с типами
- SCSS переменные и структура файлов
- Написание unit тестов для validateField

## Что правилось вручную
- Конкретный контент секций (биография, описания проектов)
- CSS детали дизайна (spacing, transitions)
- Финальная настройка env переменных и Vercel dashboard
- Email templates (HTML письма)
- Отладка CORS в локальном окружении (vercel dev + vite proxy)
- [ЗАПОЛНИТЬ ПОСЛЕ РЕАЛИЗАЦИИ]
```

---

## Фазы реализации

### Phase 1 — Структура и стили (3–4 ч)
- [ ] Инициализация: `npm create vite@latest`, установка SCSS, concurrently
- [ ] `tsconfig.json` с `"moduleResolution": "bundler"`, `strict`, `noUncheckedIndexedAccess`
- [ ] `index.html` со всеми 5 секциями, honeypot полем, SVG sprite
- [ ] SCSS: `_variables.scss` (CSS custom props + SCSS vars), reset, typography
- [ ] Self-hosted шрифты + preload в `<head>`
- [ ] Dark theme blocking script
- [ ] Компоненты: hero, stack grid, cases cards, nav
- [ ] Адаптивность (mobile-first)

### Phase 2 — TypeScript и форма (1.5–2.5 ч)
- [ ] `types.ts`: все типы, экспорт
- [ ] `form.ts`: validators map, validateAll, postContactForm + AbortController, renderFormState via data-state
- [ ] `animations.ts`: singleton IntersectionObserver
- [ ] `main.ts`: lazy-load modules on `window.load`
- [ ] Vitest тесты для validateField

### Phase 3 — Backend (2–3 ч)
- [ ] `tsconfig.api.json` (CommonJS target)
- [ ] `api/send-email.ts`: полный handler с security middleware chain
- [ ] Email провайдер (Resend или Nodemailer — выбрать по наличию домена)
- [ ] `.env.local` с реальными ключами
- [ ] Тест: `npm run dev:all` → отправить форму → проверить письма

### Phase 4 — Полировка и деплой (1–1.5 ч)
- [ ] `vercel.json` с security headers и cache rules
- [ ] README (все разделы, включая AI disclosure)
- [ ] `npm run build` (проверить `tsc --noEmit` прошёл)
- [ ] `vercel deploy` → проверить CORS на production URL
- [ ] Lighthouse audit (target ≥ 90/90)

**Реалистичная оценка:** 8–11 часов с учётом всех деталей.

---

## Риски и решения

| Риск | Вероятность | Решение |
|------|-------------|---------|
| Resend требует верифицированный домен | Высокая | **Начать с Nodemailer + Gmail App Password** |
| `vercel link` не выполнен → `vercel dev` не работает | Средняя | Добавить в README как шаг 0 |
| Rate limiting in-memory не работает в serverless | Известно | Задокументировать в README как known limitation; Upstash для production |
| CORS в dev (Vite :5173 → Vercel :3001) | Средняя | Vite proxy в `vite.config.ts` решает это |
| `tsc --noEmit` падает из-за api/ DOM типов | Низкая | Отдельный `tsconfig.api.json` |
| Email в спам | Средняя | Gmail App Password — из personal адреса, часто в инбоксе |
| 7 кейс-карточек растягивают Phase 1 | Высокая | Сократить до 4-5 наиболее сильных проектов |

---

## Ссылки

- Источник данных: https://slava.berghub.ru
- Resend docs: https://resend.com/docs
- Vercel Serverless Functions: https://vercel.com/docs/functions
- Vite config docs: https://vitejs.dev/config
- TypeScript `moduleResolution: "bundler"`: https://www.typescriptlang.org/tsconfig#moduleResolution
- Vitest: https://vitest.dev
- Feature-Sliced Design: https://feature-sliced.design
- Upstash Rate Limiting: https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
