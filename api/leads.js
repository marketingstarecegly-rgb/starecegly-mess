// /api/leads – panel admina (nagłówek X-Admin-Pin)
//   GET  → { leads, config }
//   POST { action: 'resend', ids }               → ponowna wysyłka maila powitalnego
//   POST { action: 'config', patch }             → zmiana ustawień QR / przypomnień (wspólne dla wszystkich urządzeń)
//   POST { action: 'optout', ids, value }        → wykluczenie z przypomnienia (kupił / wypisał się) albo przywrócenie
//   POST { action: 'reminders-run' }             → wyślij teraz zaległe przypomnienia (jak codzienny cron)
//   POST { action: 'test-mail', kind, lang, email } → mail testowy (powitanie / przypomnienie) na podany adres
import { db, COLLECTION, safeEqual, deliverWelcome, getConfig, setConfig, setReminderOptOut, runReminders,
         sendMail, renderWelcome, renderReminder } from './_lib.js';

export const config = { maxDuration: 60 };
const appUrlEnv = () => (process.env.APP_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || '').trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
const iso = v => (v && typeof v.toDate === 'function') ? v.toDate().toISOString() : (v || null);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).json({ error: 'method' });
  if (!safeEqual(req.headers['x-admin-pin'], process.env.ADMIN_PIN)) {
    await new Promise(r => setTimeout(r, 800)); // spowolnienie zgadywania PIN-u
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
      const ids = Array.isArray(body?.ids) ? body.ids.map(String).filter(Boolean).slice(0, 50) : [];
      switch (body?.action) {
        case 'resend': {
          if (!ids.length) break;
          const results = [];
          for (const id of ids) results.push({ id, ...(await deliverWelcome(db().collection(COLLECTION).doc(id))) });
          return res.json({ results });
        }
        case 'config':
          return res.json({ config: { ...(await setConfig(body.patch || {})), appUrl: appUrlEnv() } });
        case 'optout':
          if (!ids.length) break;
          await setReminderOptOut(ids, body.value !== false);
          return res.json({ ok: true });
        case 'reminders-run':
          return res.json(await runReminders({ budgetMs: 45000 }));
        case 'test-mail': {
          const email = String(body.email || '').trim().toLowerCase();
          if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'email' });
          const cfg = await getConfig();
          const lang = ['pl', 'en', 'de'].includes(body.lang) ? body.lang : 'pl';
          const lead = { id: 'test-' + Date.now(), name: { pl: 'Jan Kowalski', en: 'John Smith', de: 'Max Mustermann' }[lang], email, lang,
            interests: ['elewacja', 'akcesoria'], event: cfg.qrEvent || 'Facade Expo 2026', source: 'form', createdAt: new Date().toISOString() };
          const r = body.kind === 'reminder' ? renderReminder(lead) : renderWelcome(lead);
          r.subject = '[TEST] ' + r.subject;
          try { await sendMail(lead, r, lead.id); return res.json({ ok: true }); }
          catch (e) { return res.json({ ok: false, error: e.message }); }
        }
      }
      return res.status(400).json({ error: 'bad request' });
    }

    const [snap, cfg] = await Promise.all([db().collection(COLLECTION).orderBy('createdAt', 'desc').limit(10000).get(), getConfig()]);
    const leads = snap.docs.map(d => {
      const x = d.data();
      return {
        id: d.id, name: x.name, email: x.email, phone: x.phone, customerType: x.customerType,
        interests: x.interests || [], note: x.note, event: x.event, consent: !!x.consent, lang: x.lang || 'de',
        company: x.company || '', position: x.position || '', website: x.website || '', address: x.address || '', source: x.source || 'form',
        createdAt: iso(x.createdAt), mailStatus: x.mailStatus, mailError: x.mailError || null, welcomeSentAt: iso(x.welcomeSentAt),
        reminderStatus: x.reminderStatus || null, reminderSentAt: iso(x.reminderSentAt), reminderPending: !!x.reminderPending,
        reminderOptOut: !!x.reminderOptOut, reminderSkip: x.reminderSkip || null, reminderError: x.reminderError || null
      };
    });
    const appUrl = appUrlEnv();
    return res.json({ leads, config: { ...cfg, appUrl } });
  } catch (e) {
    console.error('leads', e);
    return res.status(500).json({ error: 'server', detail: String(e.message).slice(0, 200) });
  }
}
