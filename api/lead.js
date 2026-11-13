// POST /api/lead – zapis zgłoszenia z tabletu + mail powitalny (idempotentnie po id).
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { db, COLLECTION, safeEqual, cleanLead, deliverWelcome } from './_lib.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  if (!safeEqual(req.headers['x-kiosk-key'], process.env.KIOSK_KEY)) return res.status(401).json({ error: 'unauthorized' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
  const { lead, error } = cleanLead(body);
  if (error) return res.status(400).json({ error });

  try {
    const ref = db().collection(COLLECTION).doc(lead.id);
    // Utwórz rekord tylko, jeśli jeszcze go nie ma (ponowne wysłanie z tabletu niczego nie nadpisuje).
    await db().runTransaction(async t => {
      const snap = await t.get(ref);
      if (!snap.exists) t.set(ref, {
        ...lead,
        createdAt: Timestamp.fromDate(new Date(lead.createdAt)),
        receivedAt: FieldValue.serverTimestamp(),
        mailStatus: 'pending',
        mailAttempts: 0
      });
    });
    const r = await deliverWelcome(ref);
    return res.json({ ok: true, mailSent: r.mailSent, mailError: r.mailError || null });
  } catch (e) {
    console.error('lead', e);
    return res.status(500).json({ error: 'server', detail: String(e.message).slice(0, 200) });
  }
}
