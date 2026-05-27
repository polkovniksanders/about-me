import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

// ─── Env validation at module startup ─────────────────────────────────────────
// Fail fast on misconfiguration rather than silent partial failure at send time

const REQUIRED_ENV = ['RESEND_API_KEY', 'OWNER_EMAIL', 'FROM_EMAIL', 'ALLOWED_ORIGIN'] as const;
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const resend = new Resend(process.env['RESEND_API_KEY'] as string);

// ─── Security helpers ─────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function sanitizeHeader(value: string): string {
  // Prevent email header injection via newline characters
  return value.replace(/[\r\n\t]+/g, ' ').trim();
}

function stripControlChars(str: string): string {
  // Remove null bytes and other control characters (preserve newlines in comments)
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

// ─── CORS ─────────────────────────────────────────────────────────────────────

function setCorsHeaders(req: VercelRequest, res: VercelResponse): boolean {
  const origin = (req.headers['origin'] as string | undefined) ?? '';
  const allowedOrigin = process.env['ALLOWED_ORIGIN'] as string;
  const devOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'];

  const isAllowed = origin === allowedOrigin || devOrigins.includes(origin);
  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin'); // required when not using wildcard
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true; // preflight handled — caller should return
  }
  return false;
}

// ─── Validation ───────────────────────────────────────────────────────────────

interface ParsedBody {
  name: string;
  phone: string;
  email: string;
  comment: string;
  honeypot: string;
  _formLoadTime: string;
}

function parseAndValidate(body: unknown): ParsedBody | string {
  if (typeof body !== 'object' || body === null) return 'Invalid request body';

  const b = body as Record<string, unknown>;

  const name    = typeof b['name']    === 'string' ? b['name'].trim()    : '';
  const phone   = typeof b['phone']   === 'string' ? b['phone'].trim()   : '';
  const email   = typeof b['email']   === 'string' ? b['email'].trim()   : '';
  const comment = typeof b['comment'] === 'string' ? b['comment'].trim() : '';
  const honeypot = typeof b['honeypot'] === 'string' ? b['honeypot'] : '';
  const _formLoadTime = typeof b['_formLoadTime'] === 'string' ? b['_formLoadTime'] : '0';

  if (!name || name.length < 2 || name.length > 100)
    return 'Invalid name: must be 2–100 characters';

  if (!email || email.length > 254)
    return 'Invalid email';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return 'Invalid email format';
  if (/[\r\n]/.test(email))
    return 'Invalid email: contains illegal characters';

  if (!phone || phone.length > 30)
    return 'Invalid phone';
  if (!/^[+\d\s()\-]{7,30}$/.test(phone))
    return 'Invalid phone format';

  if (!comment || comment.length < 10 || comment.length > 2000)
    return 'Invalid comment: must be 10–2000 characters';

  return {
    name:    escapeHtml(stripControlChars(name)),
    phone:   escapeHtml(phone),
    email,   // used as header value — do NOT HTML-escape
    comment: escapeHtml(stripControlChars(comment)),
    honeypot,
    _formLoadTime,
  };
}

// ─── Rate limiting (in-memory — resets on cold start) ─────────────────────────
// Sufficient for a personal landing page. Document as known limitation.
// For production scale: replace with Upstash Redis @upstash/ratelimit

const submissionLog = new Map<string, number>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const lastSubmit = submissionLog.get(ip) ?? 0;
  if (now - lastSubmit < 60_000) return true; // 1 submission per minute per IP
  submissionLog.set(ip, now);
  return false;
}

// ─── Email templates ──────────────────────────────────────────────────────────

function buildOwnerEmail(parsed: ParsedBody): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #4fd1c5; border-bottom: 2px solid #4fd1c5; padding-bottom: 8px;">
        Новое сообщение с сайта
      </h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #666; width: 100px;">Имя:</td>
          <td style="padding: 8px 0; font-weight: 600;">${parsed.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Email:</td>
          <td style="padding: 8px 0;">${escapeHtml(parsed.email)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Телефон:</td>
          <td style="padding: 8px 0;">${parsed.phone}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666; vertical-align: top;">Сообщение:</td>
          <td style="padding: 8px 0;">${parsed.comment.replace(/\n/g, '<br>')}</td>
        </tr>
      </table>
    </div>
  `;
}

function buildAutoReply(name: string): string {
  // Only fixed template content — never reflect user input into auto-reply body
  // to prevent using this endpoint as an open mail relay for phishing
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #4fd1c5;">Сообщение получено!</h2>
      <p>Привет, ${escapeHtml(name)}!</p>
      <p>Я получил ваше сообщение и отвечу в ближайшее время.</p>
      <p>Также можете написать мне напрямую в Telegram: <strong>@berghub</strong></p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 14px;">Вячеслав Попов · Fullstack Engineer</p>
    </div>
  `;
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // 1. CORS (handles OPTIONS preflight)
  if (setCorsHeaders(req, res)) return;

  // 2. Method check
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  // 3. Content-Type enforcement
  // Prevents simple-request CORS bypass (no preflight for form-urlencoded)
  const contentType = (req.headers['content-type'] as string | undefined) ?? '';
  if (!contentType.includes('application/json')) {
    res.status(415).json({ success: false, error: 'Content-Type must be application/json' });
    return;
  }

  // 4. Body size limit
  const rawBody = JSON.stringify(req.body ?? {});
  if (rawBody.length > 10_000) {
    res.status(413).json({ success: false, error: 'Request body too large' });
    return;
  }

  // 5. Parse and validate
  const parsed = parseAndValidate(req.body as unknown);
  if (typeof parsed === 'string') {
    res.status(400).json({ success: false, error: parsed });
    return;
  }

  // 6. Honeypot check (silent success — don't signal detection to bots)
  if (parsed.honeypot !== '') {
    res.status(200).json({ success: true });
    return;
  }

  // 7. Timing check — bots fill forms instantly (< 3 seconds)
  const elapsed = Date.now() - parseInt(parsed._formLoadTime, 10);
  if (elapsed < 3000 || elapsed > 3_600_000) {
    res.status(200).json({ success: true });
    return;
  }

  // 8. Rate limiting
  const ip = String(
    (req.headers['x-forwarded-for'] as string | undefined) ?? ''
  ).split(',')[0]?.trim() || 'unknown';

  if (isRateLimited(ip)) {
    res.status(429).json({ success: false, error: 'Слишком много запросов. Попробуйте через минуту.' });
    return;
  }

  // 9. Send email to owner (critical — failure returns 500)
  try {
    await resend.emails.send({
      from: process.env['FROM_EMAIL'] as string,
      to: [process.env['OWNER_EMAIL'] as string],
      replyTo: parsed.email,
      subject: `Новое сообщение с сайта от ${sanitizeHeader(parsed.name)}`,
      html: buildOwnerEmail(parsed),
    });
  } catch (err) {
    console.error('[send-email] owner notification failed:', err);
    res.status(500).json({ success: false, error: 'Не удалось отправить сообщение. Попробуйте позже.' });
    return;
  }

  // 10. Send auto-reply to user (non-critical — log but don't fail the request)
  try {
    await resend.emails.send({
      from: process.env['FROM_EMAIL'] as string,
      to: [parsed.email],
      subject: 'Сообщение получено',
      html: buildAutoReply(parsed.name),
    });
  } catch (err) {
    console.error('[send-email] auto-reply failed:', err);
  }

  res.status(200).json({ success: true });
}
