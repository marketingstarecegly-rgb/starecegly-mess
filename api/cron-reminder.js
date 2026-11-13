// Uruchamiane codziennie przez Vercel Cron (vercel.json). Wysyła zaległe przypomnienia.
// Jeśli ustawisz CRON_SECRET w Vercelu, wywołanie bez tego sekretu zostanie odrzucone.
import { runReminders } from './_lib.js';

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const secret = (process.env.CRON_SECRET || '').trim();
  if (secret && req.headers.authorization !== `Bearer ${secret}`) return res.status(401).json({ error: 'unauthorized' });
  try {
    const out = await runReminders({ budgetMs: 45000 });
    console.log('reminders', JSON.stringify(out));
    return res.json({ ok: true, ...out });
  } catch (e) {
    console.error('cron-reminder', e);
    return res.status(500).json({ error: 'server', detail: String(e.message).slice(0, 200) });
  }
}
