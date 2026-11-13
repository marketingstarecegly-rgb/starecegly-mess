// GET /api/ping – test konfiguracji: baza + połączenie z serwerem poczty (bez wysyłania maila).
import { db, COLLECTION, safeEqual, verifyMail, DISCOUNT } from './_lib.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!safeEqual(req.headers['x-kiosk-key'], process.env.KIOSK_KEY)) return res.status(401).json({ error: 'unauthorized' });
  let dbOk = false, dbError = null;
  try { await db().collection(COLLECTION).limit(1).get(); dbOk = true; }
  catch (e) { dbError = String(e.message).slice(0, 200); console.error('ping db', dbError); }
  const mail = await verifyMail();
  return res.json({
    ok: true,
    db: dbOk, dbError,
    mail: mail.ok, mailMode: mail.mode, mailError: mail.error || null,
    smtp: mail.mode === 'smtp' ? { host: process.env.SMTP_HOST, port: process.env.SMTP_PORT || '465', user: process.env.SMTP_USER } : null,
    scan: !!process.env.GEMINI_API_KEY,
    code: DISCOUNT.code,
    pct: DISCOUNT.pct,
    commit: (process.env.VERCEL_GIT_COMMIT_SHA || '').slice(0, 7)
  });
}
