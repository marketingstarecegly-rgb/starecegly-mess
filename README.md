# Starecegly.com – aplikacja targowa (Facade Expo 2026)

Formularz na tablet/telefon dla odwiedzających stoisko. Po zapisie wysyła się automatycznie mail z kuponem **5% (kod FACADE5)**.
Kontakty są zapisywane w Firestore, a eksport działa do Excela i PDF. Aplikacja ma też:
- skaner wizytówek (Gemini),
- kod QR i plakat A4,
- mail przypominający,
- tryb offline,
- języki PL / EN / DE (domyślnie PL).

Facade Expo 2026 · 24–26.11.2026 · Ptak Warsaw Expo, Nadarzyn

## Wdrożenie (tak samo jak alteziegel, tylko nowy projekt)

1. **GitHub** – utwórz nowe repo, np. `starecegly-targi`, i wgraj całą zawartość tego folderu (*Add file → Upload files*).
2. **Vercel** – *Add New → Project* → wybierz to repo → *Deploy*.
3. **Vercel → Settings → Environment Variables**:

   | Zmienna | Wartość |
   |---|---|
   | `FIREBASE_SERVICE_ACCOUNT` | ten sam JSON co w alteziegel (dane trafią do osobnej kolekcji `targi_leads`) |
   | `SMTP_HOST` | `s.mail.dcsaas.net` |
   | `SMTP_PORT` | `587` |
   | `SMTP_USER` | `wojtek.rutkowski@starecegly.com` |
   | `SMTP_PASS` | hasło do tej skrzynki |
   | `KIOSK_KEY` | dowolne hasło urządzenia (wpisujesz je przy pierwszym uruchomieniu na tablecie) |
   | `ADMIN_PIN` | PIN do panelu admina |
   | `GEMINI_API_KEY` | ten sam klucz co w alteziegel (skaner wizytówek) |
   | `MAIL_REPLY_TO` | *(opcjonalnie)* adres na odpowiedzi klientów, np. `starecegly@gmail.com` |
   | `CRON_SECRET` | *(opcjonalnie)* zabezpieczenie maila przypominającego |

   Po dodaniu zmiennych: *Deployments → ⋯ → Redeploy*.
4. **Shoper (starecegly.com)** – utwórz kod rabatowy **FACADE5** = 5%. Kod i procent można zmienić w `api/_config.js`.
5. **Tablet** – otwórz adres aplikacji i wpisz `KIOSK_KEY` oraz nazwę wydarzenia `Facade Expo 2026`. Dodaj aplikację do ekranu głównego.
6. **Panel → Marketing** – włącz kod QR, wpisz nazwę wydarzenia i pobierz plakat A4 (QR wskazuje na produkcyjny adres Vercel).
7. **Test** – *Panel → Ustawienia → Wyślij testowy mail*.

## Gdzie co zmienić
- Rabat, kategorie zainteresowań, link do katalogu, dane firmy → `api/_config.js`
- Treść maili (PL/EN/DE) → `api/_templates.js`
- Teksty na ekranie → `index.html` (słownik `I18N`)
