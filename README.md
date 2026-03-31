# TryggTale

Sanntids svindeldeteksjon for telefonsamtaler. Åpen kildekode, gratis for alle.

Jeg startet dette prosjektet fordi jeg syns det er uakseptabelt at eldre mennesker i 2026 fortsatt taper livsoppsparingen sin til telefonsvindel — og at ingen lager noe enkelt nok til at det faktisk hjelper dem.

---

## Hva er dette?

TryggTale lytter på samtalen mens den pågår og slår alarm hvis noen prøver å lure deg til å gi fra deg BankID, passord, kortnummer eller annen sensitiv informasjon.

Ingen opptak. Ingen sky. Alt kjøres lokalt i nettleseren din — ingenting forlater enheten.

Det som gjør dette annerledes enn det som finnes i dag: eksisterende løsninger blokkerer kjente svindelnumre. Det hjelper ikke når svindleren allerede er inne i samtalen og snakker deg inn i å gjøre noe dumt. Det er det gapet dette prosjektet prøver å tette.

---

## Demo

Gå til nettsiden, trykk på telefonikonet og svar når Olga (93 år) ringer. Snakk norsk inn i mikrofonen som om du er en svindler — og se risikomåleren reagere i sanntid.

Prøv for eksempel:
- "Hei, jeg ringer fra Microsoft..."
- "Du har en faktura som ikke er betalt"
- "Kan du lese opp tallene på baksiden av kortet?"
- "Gi meg BankID-koden din"

Systemet fanger opp ord midt i setninger, ikke bare når du er ferdig med å snakke.

---

## Teknologi

React + TypeScript, bygget med Vite. Talegjenkjenning via Web Speech API satt til norsk bokmål (`nb-NO`). Risikoanalysen er en lokal nøkkelordmotor — ingen modeller, ingen API-kall, ingen backend.

Det endelige produktet vil bruke voice-to-text og ML på en ordentlig måte. Men kjernelogikken fungerer allerede, og den er enkel nok til å kjøre på en gammel telefon.

---

## Kom i gang

```bash
git clone https://github.com/ditt-brukernavn/tryggtale.git
cd tryggtale
npm install
npm run dev
```

Åpne [http://localhost:5173](http://localhost:5173). For produksjonsbygg: `npm run build`.

---

## Filstruktur

```
src/
  components/
    PhoneDemo.tsx     ← selve demoen, all deteksjonslogikk her
    ui/               ← shadcn/ui komponenter
  pages/
    Home.tsx          ← landingssiden
  App.tsx
public/
  sw.js               ← service worker for offline-støtte
```

---

## Bidra

Alle bidrag er velkomne — enten det er nye svindelord, bedre deteksjonslogikk, støtte for andre språk, eller noe helt annet. Åpne en issue eller send en PR.

Sikkerhetsproblemer: [sigurd100@gmail.com](mailto:sigurd100@gmail.com)

---

## Kontakt

Sigurd Yrke Bleie
[sigurdyb@stud.ntnu.no](mailto:sigurdyb@stud.ntnu.no)
[sigurd100@gmail.com](mailto:sigurd100@gmail.com)
[+47 947 92 960](callto:+4794792960)

---

## Lisens

MIT. Gjør hva du vil med det — bare hjelp folk.
