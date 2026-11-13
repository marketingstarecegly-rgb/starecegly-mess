// /api/public – formularz na telefonie odwiedzającego (kod QR na stoisku). Bez klucza kiosku.
//   GET  → { enabled, event }           czy formularz QR jest włączony w panelu
//   POST → zapis zgłoszenia + mail powitalny
// Ochrona: włącznik w panelu, limit zapisów na IP i godzinę, pole-pułapka dla botów,
// minimalny czas wypełniania, jeden kupon na adres e-mail (30 dni).
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { db, COLLECTION, cleanLead, deliverWelcome, getConfig, rateLimit } from './_lib.js';

const ipOf = req => String(req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket?.remoteAddress || '').split(',')[0].trim();

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const cfg = await getConfig();
    if (req.method === 'GET') return res.json({ enabled: !!cfg.qrEnabled, event: cfg.qrEvent || '' });
    if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
    if (!cfg.qrEnabled) return res.status(403).json({ error: 'disabled' });

    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
    if (!body || typeof body !== 'object') return res.status(400).json({ error: 'body' });

    // Boty: wypełnione ukryte pole albo formularz wysłany „błyskawicznie” → udajemy sukces, nic nie zapisujemy.
    if (body.hp || Number(body.fillMs) < 2500) return res.json({ ok: true, mailSent: true });

    const { lead, error } = cleanLead({ ...body, source: 'qr', event: cfg.qrEvent || body.event || '' });
    if (error) return res.status(400).json({ error });

    if (!(await rateLimit(ipOf(req)))) return res.status(429).json({ error: 'rate' });

    const ref = db().collection(COLLECTION).doc(lead.id);
    const existing = await ref.get();
    if (!existing.exists) {
      // Jeden kupon na adres e-mail: jeśli ta osoba dostała już powitanie w ostatnich 30 dniach – zapisujemy, ale bez maila.
      const prev = await db().collection(COLLECTION).where('email', '==', lead.email).where('mailStatus', '==', 'sent').limit(5).get();
      const recent = prev.docs.some(d => Date.now() - (d.data().welcomeSentAt?.toMillis?.() || 0) < 30 * 86400000);
      await ref.set({ ...lead, createdAt: Timestamp.fromDate(new Date(lead.createdAt)), receivedAt: FieldValue.serverTimestamp(),
        mailStatus: recent ? 'duplicate' : 'pending', mailAttempts: 0 });
      if (recent) return res.json({ ok: true, mailSent: false, duplicate: true });
    } else if (existing.data().mailStatus === 'duplicate') {
      return res.json({ ok: true, mailSent: false, duplicate: true });
    }
    const r = await deliverWelcome(ref);
    return res.json({ ok: true, mailSent: r.mailSent, duplicate: r.state === 'duplicate' });
  } catch (e) {
    console.error('public', e);
    return res.status(500).json({ error: 'server' });
  }
}
