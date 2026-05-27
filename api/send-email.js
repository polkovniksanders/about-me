// @ts-check
const { Resend } = require('resend');

// ─── Security helpers ─────────────────────────────────────────────────────────

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function sanitizeHeader(value) {
  return value.replace(/[\r\n\t]+/g, ' ').trim();
}

function stripControlChars(str) {
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

// ─── CORS ─────────────────────────────────────────────────────────────────────

function setCorsHeaders(req, res) {
  const origin = req.headers['origin'] || '';
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '';
  const devOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'];

  if (origin === allowedOrigin || devOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function parseAndValidate(body) {
  if (typeof body !== 'object' || body === null) return 'Invalid request body';

  const name     = typeof body.name    === 'string' ? body.name.trim()    : '';
  const phone    = typeof body.phone   === 'string' ? body.phone.trim()   : '';
  const email    = typeof body.email   === 'string' ? body.email.trim()   : '';
  const comment  = typeof body.comment === 'string' ? body.comment.trim() : '';
  const honeypot = typeof body.honeypot === 'string' ? body.honeypot : '';
  const formLoadTime = typeof body._formLoadTime === 'string' ? body._formLoadTime : '0';

  if (!name || name.length < 2 || name.length > 100)
    return 'Invalid name';
  if (!email || email.length > 254 || /[\r\n]/.test(email))
    return 'Invalid email';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return 'Invalid email format';
  if (!phone || !/^[+\d\s()\-]{7,30}$/.test(phone))
    return 'Invalid phone';
  if (!comment || comment.length < 10 || comment.length > 2000)
    return 'Invalid comment';

  return {
    name:    escapeHtml(stripControlChars(name)),
    phone:   escapeHtml(phone),
    email,
    comment: escapeHtml(stripControlChars(comment)),
    honeypot,
    formLoadTime,
  };
}

// ─── Rate limiting (in-memory) ────────────────────────────────────────────────

const submissionLog = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const last = submissionLog.get(ip) || 0;
  if (now - last < 60_000) return true;
  submissionLog.set(ip, now);
  return false;
}

// ─── Email templates ──────────────────────────────────────────────────────────

function buildOwnerEmail(parsed) {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333">
      <h2 style="color:#4fd1c5;border-bottom:2px solid #4fd1c5;padding-bottom:8px">
        Новое сообщение с сайта
      </h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#666;width:100px">Имя:</td>
            <td style="padding:8px 0;font-weight:600">${parsed.name}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Email:</td>
            <td style="padding:8px 0">${escapeHtml(parsed.email)}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Телефон:</td>
            <td style="padding:8px 0">${parsed.phone}</td></tr>
        <tr><td style="padding:8px 0;color:#666;vertical-align:top">Сообщение:</td>
            <td style="padding:8px 0">${parsed.comment.replace(/\n/g, '<br>')}</td></tr>
      </table>
    </div>
  `;
}

function buildAutoReply(name) {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333">
      <h2 style="color:#4fd1c5">Сообщение получено!</h2>
      <p>Привет, ${escapeHtml(name)}!</p>
      <p>Я получил ваше сообщение и отвечу в ближайшее время.</p>
      <p>Также можете написать напрямую в Telegram: <strong>@berghub</strong></p>
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
      <p style="color:#999;font-size:14px">Вячеслав Попов · Fullstack Engineer</p>
    </div>
  `;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

module.exports = async function handler(req, res) {
  if (setCorsHeaders(req, res)) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('application/json')) {
    res.status(415).json({ success: false, error: 'Content-Type must be application/json' });
    return;
  }

  // Env check — return 500 with message instead of crashing
  const apiKey   = process.env.RESEND_API_KEY;
  const ownerEmail = process.env.OWNER_EMAIL;
  const fromEmail  = process.env.FROM_EMAIL;

  if (!apiKey || !ownerEmail || !fromEmail) {
    console.error('[send-email] missing env vars');
    res.status(500).json({ success: false, error: 'Server misconfiguration' });
    return;
  }

  const rawBody = JSON.stringify(req.body || {});
  if (rawBody.length > 10_000) {
    res.status(413).json({ success: false, error: 'Request too large' });
    return;
  }

  const parsed = parseAndValidate(req.body);
  if (typeof parsed === 'string') {
    res.status(400).json({ success: false, error: parsed });
    return;
  }

  // Honeypot — silent success
  if (parsed.honeypot !== '') {
    res.status(200).json({ success: true });
    return;
  }

  // Timing check
  const elapsed = Date.now() - parseInt(parsed.formLoadTime, 10);
  if (elapsed < 3000 || elapsed > 3_600_000) {
    res.status(200).json({ success: true });
    return;
  }

  // Rate limiting
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (isRateLimited(ip)) {
    res.status(429).json({ success: false, error: 'Слишком много запросов. Попробуйте через минуту.' });
    return;
  }

  const resend = new Resend(apiKey);

  // Send to owner (critical)
  try {
    await resend.emails.send({
      from:    fromEmail,
      to:      [ownerEmail],
      replyTo: parsed.email,
      subject: `Новое сообщение с сайта от ${sanitizeHeader(parsed.name)}`,
      html:    buildOwnerEmail(parsed),
    });
  } catch (err) {
    console.error('[send-email] owner send failed:', err);
    res.status(500).json({ success: false, error: 'Не удалось отправить сообщение. Попробуйте позже.' });
    return;
  }

  // Auto-reply (non-critical)
  try {
    await resend.emails.send({
      from:    fromEmail,
      to:      [parsed.email],
      subject: 'Сообщение получено',
      html:    buildAutoReply(parsed.name),
    });
  } catch (err) {
    console.error('[send-email] auto-reply failed:', err);
  }

  res.status(200).json({ success: true });
};
