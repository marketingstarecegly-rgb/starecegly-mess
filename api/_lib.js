// Wspólne: Firestore, autoryzacja, szablon maila, wysyłka przez Resend.
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import crypto from 'node:crypto';

export const COLLECTION = process.env.FIRESTORE_COLLECTION || 'targi_leads';

export function db() {
  if (!getApps().length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT is not set');
    const json = JSON.parse(raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8'));
    initializeApp({ credential: cert(json) });
  }
  return getFirestore();
}

export function safeEqual(a, b) {
  const A = Buffer.from(String(a || '')), B = Buffer.from(String(b || ''));
  return A.length > 0 && A.length === B.length && crypto.timingSafeEqual(A, B);
}

import { DISCOUNT, SHOP, CATALOG_URL, INTERESTS, CUSTOMER_TYPES } from './_config.js';
import { renderWelcome, renderReminder, unsubWord, LANGS } from './_templates.js';
export { DISCOUNT, SHOP, CATALOG_URL, INTERESTS, CUSTOMER_TYPES, renderWelcome, renderReminder };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const str = (v, max) => String(v ?? '').trim().slice(0, max);

// Walidacja i czyszczenie danych z tabletu. Zwraca { lead } albo { error }.
export function cleanLead(b) {
  if (!b || typeof b !== 'object') return { error: 'no body' };
  const lead = {
    id: str(b.id, 64).replace(/[^\w-]/g, ''),
    name: str(b.name, 120),
    email: str(b.email, 160).toLowerCase(),
    phone: str(b.phone, 40),
    customerType: CUSTOMER_TYPES.includes(b.customerType) ? b.customerType : '',
    interests: Array.isArray(b.interests) ? [...new Set(b.interests.filter(i => INTERESTS[i]))] : [],
    note: str(b.note, 600),
    event: str(b.event, 120),
    company: str(b.company, 160),
    position: str(b.position, 120),
    website: str(b.website, 200),
    address: str(b.address, 300),
    source: ['card', 'qr'].includes(b.source) ? b.source : 'form',   // card = wizytówka, qr = telefon gościa (kod QR)
    consent: b.consent === true,
    consentText: str(b.consentText, 1000),
    createdAt: isNaN(Date.parse(b.createdAt)) ? new Date().toISOString() : new Date(b.createdAt).toISOString(),
    lang: LANGS.includes(b.lang) ? b.lang : 'pl'
  };
  if (lead.id.length < 8) return { error: 'id' };
  // Z wizytówki może nie dać się odczytać nazwiska – wtedy wystarczy e-mail (mail zaczyna się od „Guten Tag,”).
  if (lead.name.length < 2 && lead.source !== 'card') return { error: 'name' };
  if (!EMAIL_RE.test(lead.email)) return { error: 'email' };
  if (!lead.consent) return { error: 'consent' };
  return { lead };
}

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Która metoda wysyłki jest skonfigurowana: 'smtp' (skrzynka pocztowa u Shopera), 'resend' albo null.
export function mailMode() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) return 'smtp';
  if (process.env.RESEND_API_KEY) return 'resend';
  return null;
}

let transporter = null;
async function getTransport() {
  if (!transporter) {
    const { default: nodemailer } = await import('nodemailer');
    const port = Number(String(process.env.SMTP_PORT || 465).trim());
    const tls = {};
    if (process.env.SMTP_TLS_SERVERNAME) tls.servername = process.env.SMTP_TLS_SERVERNAME.trim();
    if (process.env.SMTP_TLS_INSECURE === '1') tls.rejectUnauthorized = false; // tylko gdy certyfikat serwera ma inną nazwę
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST.trim(),
      port,
      secure: port === 465,             // 465 = SSL, 587 = STARTTLS
      requireTLS: port !== 465,         // na 587 wymuszamy szyfrowanie (hasło nie idzie otwartym tekstem)
      auth: { user: process.env.SMTP_USER.trim(), pass: process.env.SMTP_PASS },
      tls,
      connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000
    });
  }
  return transporter;
}

// Czytelny opis błędu (kod + treść), zapisywany przy zgłoszeniu i pokazywany w panelu.
export function errText(e) {
  return [e && e.code, e && e.responseCode, e && e.message].filter(Boolean).join(' · ').slice(0, 300);
}

// Test połączenia z serwerem poczty (bez wysyłania maila).
export async function verifyMail() {
  const mode = mailMode();
  if (!mode) return { ok: false, mode: null, error: 'Brak konfiguracji poczty (SMTP_HOST / SMTP_USER / SMTP_PASS)' };
  if (mode === 'resend') return { ok: true, mode };
  try { await (await getTransport()).verify(); return { ok: true, mode }; }
  catch (e) { transporter = null; return { ok: false, mode, error: errText(e) }; }
}

async function sendViaSmtp(lead, { from, replyTo, subject, html, text, lang }) {
  let info;
  try {
    info = await (await getTransport()).sendMail({
      from, to: lead.email, replyTo, subject, html, text,
      bcc: process.env.MAIL_BCC || undefined,
      headers: { 'List-Unsubscribe': `<mailto:${replyTo}?subject=${encodeURIComponent(unsubWord(lang))}>` }
    });
  } catch (e) { transporter = null; e.message = errText(e); throw e; }
  return info.messageId || '';
}

// Wysyła gotowy mail (powitanie albo przypomnienie) przez SMTP lub Resend.
export async function sendMail(lead, rendered, idemKey) {
  const mode = mailMode();
  if (!mode) throw new Error('Mail not configured (SMTP_* or RESEND_API_KEY)');
  const smtpUser = (process.env.SMTP_USER || '').trim();
  const defaultFrom = `Starecegly.com <${mode === 'smtp' && smtpUser.includes('@') ? smtpUser : 'starecegly@gmail.com'}>`;
  const from = process.env.MAIL_FROM || defaultFrom;
  // Odpowiedzi klientów (np. „Wypisz”) trafiają na skrzynkę, z której wysyłamy – chyba że ustawisz MAIL_REPLY_TO.
  const replyTo = (process.env.MAIL_REPLY_TO || (smtpUser.includes('@') ? smtpUser : 'starecegly@gmail.com')).trim();
  if (mode === 'smtp') return sendViaSmtp(lead, { from, replyTo, ...rendered });

  const { subject, html, text, lang } = rendered;
  const body = {
    from, to: [lead.email], reply_to: replyTo, subject, html, text,
    headers: { 'List-Unsubscribe': `<mailto:${replyTo}?subject=${encodeURIComponent(unsubWord(lang))}>` },
    tags: [{ name: 'source', value: 'messe' }]
  };
  if (process.env.MAIL_BCC) body.bcc = process.env.MAIL_BCC.split(',').map(s => s.trim()).filter(Boolean);
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': idemKey },
    body: JSON.stringify(body)
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Resend ${r.status}: ${j.message || j.name || 'error'}`);
  return j.id || '';
}
export const sendWelcome = lead => sendMail(lead, renderWelcome(lead), `welcome-${lead.id}`);

const toIso = v => v?.toDate ? v.toDate().toISOString() : (v || new Date().toISOString());

/* ---------- Konfiguracja zapisana w bazie (wspólna dla wszystkich urządzeń) ---------- */
export const DEFAULT_CONFIG = { qrEnabled: false, qrEvent: '', remindersEnabled: false, reminderDays: 7 };
const CONFIG_REF = () => db().collection(COLLECTION + '_config').doc('settings');
export async function getConfig() {
  const snap = await CONFIG_REF().get();
  return { ...DEFAULT_CONFIG, ...(snap.exists ? snap.data() : {}) };
}
export async function setConfig(patch) {
  const clean = {};
  if ('qrEnabled' in patch) clean.qrEnabled = patch.qrEnabled === true;
  if ('qrEvent' in patch) clean.qrEvent = str(patch.qrEvent, 120);
  if ('remindersEnabled' in patch) clean.remindersEnabled = patch.remindersEnabled === true;
  if ('reminderDays' in patch) { const d = Math.round(Number(patch.reminderDays)); if (d >= 1 && d <= 60) clean.reminderDays = d; }
  await CONFIG_REF().set(clean, { merge: true });
  return getConfig();
}

// Wysyła powitanie dla zapisanego rekordu – z blokadą, żeby nigdy nie wysłać dwa razy.
export async function deliverWelcome(ref) {
  const { Timestamp, FieldValue } = await import('firebase-admin/firestore');
  const database = db();
  const claim = await database.runTransaction(async t => {
    const snap = await t.get(ref);
    if (!snap.exists) return { state: 'missing' };
    const d = snap.data();
    if (d.mailStatus === 'sent') return { state: 'sent' };
    if (d.mailStatus === 'duplicate') return { state: 'duplicate' };
    if (d.sendingAt && Date.now() - d.sendingAt.toMillis() < 120000) return { state: 'busy' };
    t.set(ref, { sendingAt: Timestamp.now() }, { merge: true });
    return { state: 'go', data: d };
  });
  if (claim.state !== 'go') return { mailSent: claim.state === 'sent', state: claim.state };

  const d = claim.data;
  const lead = { ...d, id: ref.id, createdAt: toIso(d.createdAt) };
  try {
    const mailId = await sendWelcome(lead);
    await ref.set({ mailStatus: 'sent', mailId, mailError: FieldValue.delete(), welcomeSentAt: FieldValue.serverTimestamp(), sendingAt: FieldValue.delete(),
      mailAttempts: FieldValue.increment(1), ...(d.reminderOptOut ? {} : { reminderPending: true }) }, { merge: true });
    return { mailSent: true, state: 'sent' };
  } catch (e) {
    const msg = errText(e);
    console.error('mail', ref.id, msg);
    await ref.set({ mailStatus: 'error', mailError: msg, sendingAt: FieldValue.delete(), mailAttempts: FieldValue.increment(1) }, { merge: true });
    return { mailSent: false, state: 'error', mailError: msg };
  }
}

/* ---------- Przypomnienia ---------- */
// Jedno przypomnienie na osobę, X dni po mailu powitalnym. Pomija: wykluczonych ręcznie (kupił / wypisał się),
// duplikaty adresu e-mail i bardzo stare zaległości (> 30 dni po terminie).
export async function deliverReminder(ref, { force = false } = {}) {
  const { Timestamp, FieldValue } = await import('firebase-admin/firestore');
  const claim = await db().runTransaction(async t => {
    const snap = await t.get(ref);
    if (!snap.exists) return { state: 'missing' };
    const d = snap.data();
    if (d.reminderStatus === 'sent') return { state: 'sent' };
    if (!force && (d.reminderOptOut || !d.reminderPending)) return { state: 'skip' };
    if (d.reminderSendingAt && Date.now() - d.reminderSendingAt.toMillis() < 120000) return { state: 'busy' };
    t.set(ref, { reminderSendingAt: Timestamp.now() }, { merge: true });
    return { state: 'go', data: d };
  });
  if (claim.state !== 'go') return { state: claim.state };
  const d = claim.data, lead = { ...d, id: ref.id, createdAt: toIso(d.createdAt) };
  try {
    await sendMail(lead, renderReminder(lead), `reminder-${ref.id}`);
    await ref.set({ reminderStatus: 'sent', reminderSentAt: FieldValue.serverTimestamp(), reminderPending: FieldValue.delete(), reminderError: FieldValue.delete(), reminderSendingAt: FieldValue.delete() }, { merge: true });
    return { state: 'sent' };
  } catch (e) {
    const msg = errText(e);
    console.error('reminder', ref.id, msg);
    const tries = (d.reminderAttempts || 0) + 1;
    await ref.set({ reminderStatus: 'error', reminderError: msg, reminderAttempts: tries, reminderSendingAt: FieldValue.delete(),
      ...(tries >= 3 ? { reminderPending: FieldValue.delete() } : {}) }, { merge: true });
    return { state: 'error', error: msg };
  }
}

export async function runReminders({ budgetMs = 45000, force = false } = {}) {
  const { FieldValue } = await import('firebase-admin/firestore');
  const cfg = await getConfig();
  const out = { enabled: cfg.remindersEnabled, days: cfg.reminderDays, sent: 0, skipped: 0, errors: 0, notDue: 0, remaining: 0 };
  if (!cfg.remindersEnabled && !force) return out;
  const started = Date.now(), dayMs = 86400000, now = Date.now();
  const snap = await db().collection(COLLECTION).where('reminderPending', '==', true).limit(500).get();
  const seen = new Set();
  const docs = snap.docs.sort((a, b) => (a.data().welcomeSentAt?.toMillis?.() || 0) - (b.data().welcomeSentAt?.toMillis?.() || 0));
  for (const doc of docs) {
    const d = doc.data(), sentAt = d.welcomeSentAt?.toMillis?.() || 0, due = sentAt + cfg.reminderDays * dayMs;
    if (!force && due > now) { out.notDue++; continue; }
    if (Date.now() - started > budgetMs) { out.remaining++; continue; }
    const email = String(d.email || '').toLowerCase();
    let skip = d.reminderOptOut ? 'optout' : (!force && now - due > 30 * dayMs) ? 'stale' : seen.has(email) ? 'duplicate' : null;
    if (!skip) {
      const dup = await db().collection(COLLECTION).where('email', '==', email).where('reminderStatus', '==', 'sent').limit(1).get();
      if (!dup.empty) skip = 'duplicate';
    }
    seen.add(email);
    if (skip) { await doc.ref.set({ reminderPending: FieldValue.delete(), reminderStatus: 'skipped', reminderSkip: skip }, { merge: true }); out.skipped++; continue; }
    const r = await deliverReminder(doc.ref, { force: true });
    if (r.state === 'sent') out.sent++; else if (r.state === 'error') out.errors++; else out.skipped++;
  }
  return out;
}

// Wykluczenie z przypomnienia (np. klient już kupił albo się wypisał) – i ponowne włączenie.
export async function setReminderOptOut(ids, optOut) {
  const { FieldValue } = await import('firebase-admin/firestore');
  for (const id of ids) {
    const ref = db().collection(COLLECTION).doc(id), snap = await ref.get();
    if (!snap.exists) continue;
    const d = snap.data();
    if (optOut) await ref.set({ reminderOptOut: true, reminderPending: FieldValue.delete() }, { merge: true });
    else await ref.set({ reminderOptOut: FieldValue.delete(), ...(d.mailStatus === 'sent' && d.reminderStatus !== 'sent' ? { reminderPending: true, reminderStatus: FieldValue.delete(), reminderSkip: FieldValue.delete() } : {}) }, { merge: true });
  }
}

/* ---------- Ochrona publicznego formularza (QR) ---------- */
// Limit zapisów: na adres IP i łącznie na godzinę. Zwraca true, gdy wolno.
export async function rateLimit(ip, { perIp = 30, total = 500 } = {}) {
  const hour = Math.floor(Date.now() / 3600000);
  const h = crypto.createHash('sha256').update(`${ip}|${hour}|az`).digest('hex').slice(0, 32);
  const col = db().collection(COLLECTION + '_rate');
  return db().runTransaction(async t => {
    const a = col.doc(`ip_${h}`), b = col.doc(`all_${hour}`);
    const [sa, sb] = await Promise.all([t.get(a), t.get(b)]);
    const na = (sa.exists ? sa.data().n : 0) + 1, nb = (sb.exists ? sb.data().n : 0) + 1;
    if (na > perIp || nb > total) return false;
    t.set(a, { n: na, hour }); t.set(b, { n: nb, hour });
    return true;
  });
}
