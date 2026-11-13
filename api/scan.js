// POST /api/scan – odczyt danych z wizytówki (zdjęcie) przez Gemini.
// Body: { image: "data:image/jpeg;base64,..." }   Nagłówek: X-Kiosk-Key
// Odpowiedź: { ok, card: { name, company, position, email, phone, phone2, website, address } }
import { safeEqual } from './_lib.js';

export const config = { maxDuration: 30 };

const MODEL = () => (process.env.GEMINI_MODEL || 'gemini-3.6-flash').trim();
const FALLBACK_MODEL = 'gemini-flash-latest';

const PROMPT = `Du liest eine Visitenkarte (Foto, evtl. schräg, schlecht beleuchtet, polnisch/englisch/deutsch).
Gib NUR die Daten zurück, die tatsächlich auf der Karte stehen – nichts erfinden.
- name: Vor- und Nachname der Person (ohne Titel wie "Dipl.-Ing." am Anfang ist ok, "Dr." darf bleiben). Leer, wenn keine Person genannt.
- company: Firmenname.
- position: Funktion/Berufsbezeichnung.
- email: E-Mail-Adresse der Person, klein geschrieben. Bei mehreren: die persönliche (nicht info@), sonst die einzige.
- phone: bevorzugt Mobilnummer, sonst Festnetz, im internationalen Format mit + falls Land erkennbar (Polen +48, Deutschland +49, Österreich +43).
- phone2: zweite Telefonnummer, falls vorhanden.
- website: ohne https://.
- address: vollständige Adresse in einer Zeile.
- readable: false, wenn auf dem Bild keine Visitenkarte zu erkennen ist oder der Text unlesbar ist.
Prüfe E-Mail und Telefonnummer Zeichen für Zeichen (0/O, 1/l/I, rn/m).`;

const SCHEMA = {
  type: 'OBJECT',
  properties: {
    readable: { type: 'BOOLEAN' },
    name: { type: 'STRING' }, company: { type: 'STRING' }, position: { type: 'STRING' },
    email: { type: 'STRING' }, phone: { type: 'STRING' }, phone2: { type: 'STRING' },
    website: { type: 'STRING' }, address: { type: 'STRING' }
  },
  required: ['readable', 'name', 'company', 'email', 'phone']
};

async function callGemini(model, mime, data) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY.trim() },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ inline_data: { mime_type: mime, data } }, { text: PROMPT }] }],
      generationConfig: { temperature: 0, responseMimeType: 'application/json', responseSchema: SCHEMA }
    })
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error(`Gemini ${r.status}: ${j.error?.message || 'error'}`); e.status = r.status; throw e; }
  const text = j.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
  try { return JSON.parse(text); } catch { throw new Error('Gemini: nieczytelna odpowiedź'); }
}

const clean = (v, max) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  if (!safeEqual(req.headers['x-kiosk-key'], process.env.KIOSK_KEY)) return res.status(401).json({ error: 'unauthorized' });
  if (!process.env.GEMINI_API_KEY) return res.status(501).json({ error: 'not_configured', detail: 'Brak GEMINI_API_KEY w Vercelu' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(body?.image || ''));
  if (!m) return res.status(400).json({ error: 'image' });

  try {
    let out;
    try { out = await callGemini(MODEL(), m[1], m[2]); }
    catch (e) {
      // model wycofany / niedostępny → spróbuj aliasu najnowszego modelu Flash
      if (e.status === 404 || e.status === 400 && /model/i.test(e.message)) out = await callGemini(FALLBACK_MODEL, m[1], m[2]);
      else throw e;
    }
    const card = {
      name: clean(out.name, 120), company: clean(out.company, 160), position: clean(out.position, 120),
      email: clean(out.email, 160).toLowerCase().replace(/\s/g, ''),
      phone: clean(out.phone, 40), phone2: clean(out.phone2, 40),
      website: clean(out.website, 200).replace(/^https?:\/\//, ''), address: clean(out.address, 300)
    };
    const readable = out.readable !== false && !!(card.email || card.name || card.phone);
    return res.json({ ok: true, readable, card });
  } catch (e) {
    console.error('scan', e.message);
    return res.status(502).json({ error: 'ocr', detail: String(e.message).slice(0, 200) });
  }
}
