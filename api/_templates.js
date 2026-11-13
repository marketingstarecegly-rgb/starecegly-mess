// Szablony maili starecegly.com: powitanie + przypomnienie, w językach PL / EN / DE (wg lead.lang).
import { DISCOUNT, INTERESTS, SHOP, CATALOG_URL, COMPANY } from './_config.js';

export const LANGS = ['pl', 'en', 'de'];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Nazwy kategorii w mailu (linki zawsze do sklepu starecegly.com)
export const INTEREST_LABELS = {
  pl: Object.fromEntries(Object.entries(INTERESTS).map(([k, v]) => [k, v.label])),
  en: { rozbiorka: 'Reclaimed brick tiles', elewacja: 'Facade brick tiles', long: 'LONG facade tiles', klinkier: 'Clinker brick tiles',
        modern: 'Decorative brick tiles', narozniki: 'Corner tiles', podloga: 'Floor & terrace tiles', pelna: 'Reclaimed solid bricks',
        drewno: 'Wooden boards & beams', beton: 'Architectural concrete', akcesoria: 'Installation accessories', probki: 'Samples' },
  de: { rozbiorka: 'Riemchen aus Abbruchziegeln', elewacja: 'Fassadenriemchen', long: 'Fassadenriemchen LONG', klinkier: 'Klinkerriemchen',
        modern: 'Dekorative Ziegelriemchen', narozniki: 'Eckriemchen', podloga: 'Boden- & Terrassenfliesen', pelna: 'Abbruch-Vollziegel',
        drewno: 'Holzbretter & Holzbalken', beton: 'Architektonischer Beton', akcesoria: 'Montagezubehör', probki: 'Muster' }
};

const T = {
  pl: {
    locale: 'pl-PL', pct: p => `${p}%`, unsub: 'Wypisz',
    hello: n => n ? `Dzień dobry ${n},` : 'Dzień dobry,',
    event: e => ` na targach <b>${e}</b>`, eventTxt: e => ` na targach ${e}`,
    couponLabel: 'Twój kod rabatowy', couponHint: 'Wpisz go w koszyku przy zamówieniu.', valid: d => ` Ważny do ${d}.`,
    interestsTitle: 'Interesowało Cię:',
    tiles: [['Wizualizacje 3D', 'Zobacz, jak cegła będzie wyglądać w Twoim projekcie'], ['Akcesoria montażowe', 'Klej, fuga i reszta – wszystko do montażu płytek'],
            ['Katalog online', 'Przejrzyj spokojnie wszystkie produkty'], ['Płytki elewacyjne', 'Trwała cegła na fasadę z charakterem']],
    contact: ph => `Masz pytania o swój projekt? Zadzwoń: ${ph} albo po prostu odpowiedz na tę wiadomość. Zapraszamy też do showroomu w Toruniu (ul. Polna 65).`,
    contactTxt: ph => `Pytania? Zadzwoń: ${ph} albo odpowiedz na tę wiadomość. Showroom: Toruń, ul. Polna 65.`,
    regards: 'Pozdrawiamy serdecznie', team: 'Zespół Starecegly.com',
    country: 'Polska', contactLink: 'Kontakt', privacy: 'Polityka prywatności', shopTxt: 'Sklep', catalogTxt: 'Katalog online', interestsTxt: 'Interesowało Cię:',
    why: (src, d) => src === 'card'
      ? `Otrzymujesz tę wiadomość w związku z przekazaniem nam wizytówki i zgodą na kontakt na naszym stoisku targowym (${d}).`
      : `Otrzymujesz tę wiadomość w związku z zapisem na naszym stoisku targowym (${d}).`,
    stop: 'Nie chcesz więcej wiadomości? Odpowiedz „Wypisz”.',
    welcome: {
      subject: p => `Twój kupon targowy ${p} od Starecegly.com`,
      pre: (c, p) => `Twój kod ${c} – ${p} rabatu na pierwsze zamówienie w starecegly.com`,
      p1: (src, ev) => `dziękujemy za ${src === 'card' ? 'miłą rozmowę na naszym stoisku' : 'odwiedzenie naszego stoiska'}${ev}! Cieszymy się, że interesuje Cię prawdziwa cegła na ścianę i elewację.`,
      p2: p => `Tak jak obiecaliśmy, otrzymujesz <b style="color:#111111">${p} rabatu</b> na pierwsze zamówienie w naszym sklepie internetowym:`,
      p2Txt: p => `Tak jak obiecaliśmy, otrzymujesz ${p} rabatu na pierwsze zamówienie.`,
      cta: 'Przejdź do sklepu', tail: ''
    },
    reminder: {
      subject: p => `Twój kupon ${p} wciąż na Ciebie czeka`,
      pre: (c, p) => `Twój kod ${c} jest nadal ważny – ${p} rabatu na pierwsze zamówienie`,
      p1: (src, ev) => `kilka dni temu poznaliśmy się${ev} – jeszcze raz dziękujemy za zainteresowanie naszymi płytkami z cegły!`,
      p2: p => `Twój osobisty kupon na <b style="color:#111111">${p} rabatu</b> jest nadal ważny. Planujesz właśnie swój projekt? Chętnie doradzimy w sprawie ilości, formatów i pasujących akcesoriów – a próbki wyślemy Ci do domu.`,
      p2Txt: p => `Twój osobisty kupon na ${p} rabatu jest nadal ważny. Chętnie doradzimy w sprawie ilości, formatów i akcesoriów.`,
      cta: 'Wykorzystaj kupon', tail: ' To nasze jedyne przypomnienie.'
    }
  },
  en: {
    locale: 'en-GB', pct: p => `${p}%`, unsub: 'Unsubscribe',
    hello: n => n ? `Hello ${n},` : 'Hello,',
    event: e => ` at <b>${e}</b>`, eventTxt: e => ` at ${e}`,
    couponLabel: 'Your voucher code', couponHint: 'Simply enter it in the shopping cart.', valid: d => ` Valid until ${d}.`,
    interestsTitle: 'You were interested in:',
    tiles: [['3D visualisations', 'See how the bricks will look in your project'], ['Installation accessories', 'Adhesive, grout &amp; everything for installation'],
            ['Online catalogue', 'Browse all our products at your leisure'], ['Facade brick tiles', 'Durable brick with character for your facade']],
    contact: ph => `Questions about your project? Call us at ${ph} or simply reply to this email. We ship within Poland and across the EU.`,
    contactTxt: ph => `Questions? Call ${ph} or simply reply to this email. We ship within Poland and across the EU.`,
    regards: 'Kind regards', team: 'Your Starecegly.com team',
    country: 'Poland', contactLink: 'Contact', privacy: 'Privacy policy', shopTxt: 'Shop', catalogTxt: 'Online catalogue', interestsTxt: 'You were interested in:',
    why: (src, d) => src === 'card'
      ? `You are receiving this email because you gave us your business card at our trade fair stand on ${d} and agreed to be contacted.`
      : `You are receiving this email because you signed up at our trade fair stand on ${d}.`,
    stop: 'Don’t want any more emails? Simply reply with “Unsubscribe”.',
    welcome: {
      subject: p => `Your ${p} trade fair voucher from Starecegly.com`,
      pre: (c, p) => `Your code ${c} – ${p} off your first order at starecegly.com`,
      p1: (src, ev) => `thank you for ${src === 'card' ? 'the great conversation at' : 'visiting'} our stand${ev}! We’re glad you’re interested in genuine brick for walls and facades.`,
      p2: p => `As promised, you get <b style="color:#111111">${p} off</b> your first order in our online shop:`,
      p2Txt: p => `As promised, you get ${p} off your first order.`,
      cta: 'Visit the shop', tail: ''
    },
    reminder: {
      subject: p => `Your ${p} voucher is still waiting for you`,
      pre: (c, p) => `Your code ${c} is still valid – ${p} off your first order`,
      p1: (src, ev) => `a few days ago we met${ev} – thank you again for your interest in our brick tiles!`,
      p2: p => `Your personal voucher for <b style="color:#111111">${p} off</b> is still valid. Planning your project right now? We’re happy to advise you on quantities, formats and matching accessories – and we can send you samples.`,
      p2Txt: p => `Your personal voucher for ${p} off is still valid. We’re happy to advise you on quantities, formats and accessories.`,
      cta: 'Redeem your voucher', tail: ' This is our only reminder.'
    }
  },
  de: {
    locale: 'de-DE', pct: p => `${p} %`, unsub: 'Abmelden',
    hello: n => n ? `Guten Tag ${n},` : 'Guten Tag,',
    event: e => ` auf der <b>${e}</b>`, eventTxt: e => ` auf der ${e}`,
    couponLabel: 'Ihr Gutscheincode', couponHint: 'Einfach im Warenkorb eingeben.', valid: d => ` Gültig bis ${d}.`,
    interestsTitle: 'Sie haben sich für Folgendes interessiert:',
    tiles: [['3D-Visualisierungen', 'So wirken die Ziegel in Ihrem Projekt'], ['Montagezubehör', 'Kleber, Fugenmörtel &amp; alles für die Montage'],
            ['Online-Katalog', 'Alle Produkte bequem durchblättern'], ['Fassadenriemchen', 'Langlebige Ziegeloptik mit Charakter für die Fassade']],
    contact: ph => `Fragen zu Ihrem Projekt? Rufen Sie uns an unter ${ph} oder antworten Sie einfach auf diese E-Mail. Wir liefern in ganz Polen und in die EU.`,
    contactTxt: ph => `Fragen? ${ph} oder einfach auf diese E-Mail antworten. Lieferung in ganz Polen und in die EU.`,
    regards: 'Herzliche Grüße', team: 'Ihr Team von Starecegly.com',
    country: 'Polen', contactLink: 'Kontakt', privacy: 'Datenschutz', shopTxt: 'Zum Shop', catalogTxt: 'Online-Katalog', interestsTxt: 'Sie haben sich interessiert für:',
    why: (src, d) => `Sie erhalten diese E-Mail, weil Sie ${src === 'card' ? 'uns' : 'sich'} am ${d} an unserem Messestand ${src === 'card' ? 'Ihre Visitenkarte gegeben und dem Kontakt zugestimmt' : 'angemeldet'} haben.`,
    stop: 'Keine weiteren E-Mails gewünscht? Antworten Sie einfach mit „Abmelden“.',
    welcome: {
      subject: p => `Ihr ${p} Messe-Gutschein von Starecegly.com`,
      pre: (c, p) => `Ihr Code ${c} – ${p} auf Ihre erste Bestellung bei starecegly.com`,
      p1: (src, ev) => `vielen Dank für ${src === 'card' ? 'das nette Gespräch' : 'Ihren Besuch'} an unserem Stand${ev}! Schön, dass Sie sich für echte Ziegel für Wand und Fassade interessieren.`,
      p2: p => `Wie versprochen erhalten Sie <b style="color:#111111">${p} Rabatt</b> auf Ihre erste Bestellung in unserem Onlineshop:`,
      p2Txt: p => `Wie versprochen erhalten Sie ${p} Rabatt auf Ihre erste Bestellung.`,
      cta: 'Zum Onlineshop', tail: ''
    },
    reminder: {
      subject: p => `Ihr ${p} Gutschein wartet noch auf Sie`,
      pre: (c, p) => `Ihr Code ${c} ist noch gültig – ${p} auf Ihre erste Bestellung`,
      p1: (src, ev) => `vor ein paar Tagen haben wir uns${ev} kennengelernt – vielen Dank nochmals für Ihr Interesse an unseren Ziegelriemchen!`,
      p2: p => `Ihr persönlicher Gutschein über <b style="color:#111111">${p} Rabatt</b> ist weiterhin gültig. Planen Sie gerade Ihr Projekt? Wir beraten Sie gerne – auch zu Mengen, Formaten und passendem Zubehör.`,
      p2Txt: p => `Ihr persönlicher Gutschein über ${p} Rabatt ist weiterhin gültig. Wir beraten Sie gerne zu Mengen, Formaten und Zubehör.`,
      cta: 'Jetzt Gutschein einlösen', tail: ' Dies ist unsere einzige Erinnerung.'
    }
  }
};

export const unsubWord = lang => (T[lang] || T.pl).unsub;

function build(lead, kind) {
  const lang = LANGS.includes(lead.lang) ? lead.lang : 'pl';
  const t = T[lang], k = t[kind];
  const code = DISCOUNT.code, pct = t.pct(DISCOUNT.pct);
  const validUntil = (process.env.DISCOUNT_VALID_UNTIL || '').trim();
  const phone = (process.env.CONTACT_PHONE || COMPANY.phone).trim();
  const src = lead.source === 'card' ? 'card' : 'form';
  const ev = lead.event ? t.event(esc(lead.event)) : '';
  const evTxt = lead.event ? t.eventTxt(lead.event) : '';
  const date = new Date(lead.createdAt).toLocaleDateString(t.locale, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Warsaw' });
  const camp = (lead.event || 'targi').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const utm = `utm_source=targi&utm_medium=email&utm_campaign=${encodeURIComponent(camp)}&utm_content=${kind}-${lang}`;
  const link = u => u + (u.includes('?') ? '&' : '?') + utm;
  const labels = INTEREST_LABELS[lang];
  const picked = (lead.interests || []).filter(i => INTERESTS[i]).map(i => ({ label: labels[i] || INTERESTS[i].label, url: INTERESTS[i].url }));
  const subject = k.subject(pct);
  const appHost = (process.env.APP_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
  const logoUrl = appHost ? `https://${appHost}/logo.png` : '';
  const tile = (href, [title, sub]) => `<td width="48%" valign="top" bgcolor="#F6F6F6" style="width:48%;background:#F6F6F6;border-radius:8px;padding:16px">
          <a href="${href}" style="display:block;text-decoration:none;color:#111111"><b style="font-size:15px;color:#111111">${title}</b><br><span style="font-size:13px;line-height:1.5;color:#555555">${sub}</span></a>
        </td>`;
  const gap = '<td width="16" style="width:16px;min-width:16px;font-size:0;line-height:0"><div style="width:16px">&nbsp;</div></td>';
  const phoneHtml = `<a href="tel:${esc(phone.replace(/\s/g, ''))}" style="color:#111111;font-weight:600">${esc(phone)}</a>`;

  const interestsHtml = picked.length ? `
  <tr><td style="padding:8px 40px 0">
    <p style="margin:0 0 10px;font-size:16px;color:#111111;font-weight:600">${t.interestsTitle}</p>
    ${picked.map(p => `<a href="${link(p.url)}" style="display:block;margin:0 0 8px;padding:13px 16px;border:1px solid #E6E6E6;border-radius:8px;color:#111111;text-decoration:none;font-size:15px">${esc(p.label)} <span style="color:#F49E1A;font-weight:700">&rarr;</span></a>`).join('')}
  </td></tr>` : '';

  const html = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#F2F2F2;font-family:Montserrat,Arial,Helvetica,sans-serif;color:#111111">
<div style="display:none;max-height:0;overflow:hidden">${esc(k.pre(code, pct))}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F2F2F2"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden">
  <tr><td style="background:#111111;padding:20px 40px">
    ${logoUrl
      ? `<img src="${esc(logoUrl)}" width="150" height="61" alt="Starecegly.com" style="display:block;width:150px;height:auto;border:0;color:#F49E1A;font-family:Georgia,serif;font-size:26px;font-weight:700">`
      : `<span style="font-family:Georgia,serif;font-size:28px;font-weight:700"><span style="color:#ffffff">stare</span><span style="color:#F49E1A">cegly.com</span></span>`}
  </td></tr>
  <tr><td style="padding:36px 40px 8px">
    <h1 style="margin:0 0 16px;font-size:25px;line-height:1.25;font-weight:800">${esc(t.hello(lead.name))}</h1>
    <p style="margin:0 0 14px;font-size:16px;line-height:1.6;color:#555555">${k.p1(src, ev)}</p>
    <p style="margin:0 0 22px;font-size:16px;line-height:1.6;color:#555555">${k.p2(pct)}</p>
  </td></tr>
  <tr><td style="padding:0 40px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFF6E8;border:2px dashed #F49E1A;border-radius:10px">
      <tr><td align="center" style="padding:22px 16px">
        <div style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#8A5404;font-weight:700;margin-bottom:8px">${t.couponLabel}</div>
        <div style="font-family:'Courier New',monospace;font-size:34px;font-weight:700;letter-spacing:4px;color:#111111">${esc(code)}</div>
        <div style="font-size:14px;color:#555555;margin-top:8px">${t.couponHint}${validUntil ? t.valid(esc(validUntil)) : ''}</div>
      </td></tr>
    </table>
  </td></tr>
  <tr><td align="center" style="padding:26px 40px 10px">
    <a href="${link(SHOP + '/')}" style="display:inline-block;background:#F49E1A;color:#111111;text-decoration:none;font-weight:700;font-size:17px;padding:16px 34px;border-radius:6px">${k.cta}</a>
  </td></tr>
  ${interestsHtml}
  <tr><td style="padding:22px 40px 8px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="table-layout:fixed">
      <tr>${tile(link(SHOP + '/pl/i/Wizualizacje-3D/41'), t.tiles[0])}${gap}${tile(link(SHOP + '/pl/c/Akcesoria-montazowe-i-dodatki/17'), t.tiles[1])}</tr>
      <tr><td colspan="3" height="16" style="height:16px;font-size:0;line-height:0">&nbsp;</td></tr>
      <tr>${tile(esc(CATALOG_URL()), t.tiles[2])}${gap}${tile(link(SHOP + '/pl/c/Plytki-elewacyjne/125'), t.tiles[3])}</tr>
    </table>
  </td></tr>
  <tr><td style="padding:18px 40px 34px">
    <p style="margin:0;font-size:15px;line-height:1.6;color:#555555">${t.contact(phoneHtml)}</p>
    <p style="margin:18px 0 0;font-size:15px;color:#111111">${t.regards}<br><b>${t.team}</b></p>
  </td></tr>
  <tr><td style="background:#F6F6F6;padding:20px 40px;font-size:12px;line-height:1.6;color:#777777">
    Starecegly.com · ${COMPANY.name} · ${COMPANY.street}, ${COMPANY.city}, ${t.country} ·
    <a href="${SHOP}/pl/i/KONTAKT/9" style="color:#777777">${t.contactLink}</a> ·
    <a href="${SHOP}/pl/i/Polityka-prywatnosci/11" style="color:#777777">${t.privacy}</a><br>
    ${esc(t.why(src, date))}${k.tail} ${esc(t.stop)}
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  const text = [
    t.hello(lead.name), '',
    k.p1(src, evTxt), k.p2Txt(pct), '',
    `${t.couponLabel}: ${code}`,
    t.couponHint + (validUntil ? t.valid(validUntil) : ''), '',
    `${t.shopTxt}: ${link(SHOP + '/')}`,
    `${t.catalogTxt}: ${CATALOG_URL()}`,
    ...(picked.length ? ['', t.interestsTxt, ...picked.map(p => `- ${p.label}: ${link(p.url)}`)] : []),
    '', t.contactTxt(phone), '', t.regards, t.team, '', '--',
    `Starecegly.com · ${COMPANY.name} · ${COMPANY.street}, ${COMPANY.city}, ${t.country}`,
    `${t.contactLink}: ${SHOP}/pl/i/KONTAKT/9`,
    t.why(src, date) + k.tail + ' ' + t.stop
  ].join('\n');

  return { subject, html, text, lang };
}

export const renderWelcome = lead => build(lead, 'welcome');
export const renderReminder = lead => build(lead, 'reminder');
