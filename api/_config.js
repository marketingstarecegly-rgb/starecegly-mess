// Stałe wspólne: rabat, sklep, katalog, kategorie (starecegly.com).
// RABAT W MAILU – ustawiany TYLKO tutaj (zmienne DISCOUNT_* w Vercelu są ignorowane).
// Kod musi istnieć w Shoperze starecegly.com z identyczną nazwą i wartością.
export const DISCOUNT = { code: 'FACADE5', pct: '5' };

export const SHOP = 'https://starecegly.com';
export const CATALOG_URL = () => (process.env.CATALOG_URL || 'https://publuu.com/flip-book/682036/1519947').trim();
export const COMPANY = { name: 'Stare Cegły Sp. z o.o.', street: 'ul. Polna 65', city: '87-100 Toruń', phone: '+48 56 307 05 55' };
export const INTERESTS = {
  rozbiorka: { label: 'Płytki z cegły rozbiórkowej',  url: `${SHOP}/pl/c/Plytki-z-cegly-rozbiorkowej-Historic-Line/13` },
  elewacja:  { label: 'Płytki elewacyjne',            url: `${SHOP}/pl/c/Plytki-elewacyjne/125` },
  long:      { label: 'Płytki elewacyjne LONG',       url: `${SHOP}/pl/c/Plytki-elewacyjne-LONG/130` },
  klinkier:  { label: 'Płytki z cegły klinkierowej',  url: `${SHOP}/pl/c/Plytki-z-cegly-klinkierowej/81` },
  modern:    { label: 'Dekoracyjne płytki ceglane',   url: `${SHOP}/pl/c/Dekoracyjne-plytki-ceglane-Modern-Line/15` },
  narozniki: { label: 'Płytki narożne',               url: `${SHOP}/pl/c/Plytki-narozne/118` },
  podloga:   { label: 'Płytki podłogowe i tarasowe',  url: `${SHOP}/pl/c/Plytki-podlogowe-i-tarasowe/120` },
  pelna:     { label: 'Cegła rozbiórkowa pełna',      url: `${SHOP}/pl/c/Cegla-rozbiorkowa-pelna/117` },
  drewno:    { label: 'Deski i belki drewniane',      url: `${SHOP}/pl/c/Rustykalne-deski/27` },
  beton:     { label: 'Beton architektoniczny',       url: `${SHOP}/pl/c/Beton-architektoniczny/24` },
  akcesoria: { label: 'Akcesoria montażowe',          url: `${SHOP}/pl/c/Akcesoria-montazowe-i-dodatki/17` },
  probki:    { label: 'Próbki',                       url: `${SHOP}/pl/c/Zamow-probki/22` }
};
export const CUSTOMER_TYPES = ['privat', 'handwerk', 'planer', 'handel'];
