// ============================================================
// PhoneDemo.tsx — TryggTale sanntids svindeldeteksjon
//
// Simulerer en telefonsamtale med "Olga" (93 år).
// Lytter på mikrofonen med Web Speech API (norsk bokmål),
// scorer ord og fraser mot risikolisten og viser en
// thermostat-måler som stiger i sanntid.
//
// Ved 70 % risiko avsluttes samtalen automatisk og
// brukeren ser "Olga har lagt på — telefonen er sikret."
//
// Ingen lyd, opptak eller data forlater nettleseren.
// ============================================================

import { useState, useRef, useEffect } from "react";

// ============================================================
// RISIKOORD-LISTE
// Legg til / endre ord her for å justere deteksjon.
// score : poeng per treff (summeres, maks 100)
// Strukturert som flat Record for rask oppslag.
// ============================================================
const RISK_WORDS: Record<string, number> = {

  // ── TRUSLER ─────────────────────────────────────────────
  "tar livet": 80, "ta livet": 80, "drepe": 80, "dreper": 80, "drepte": 80,
  "skade deg": 65, "skader deg": 65,
  "slå deg": 60, "slår deg": 60, "banke deg": 60, "banker deg": 60,
  "konsekvenser": 25, "angre": 15, "angre på": 18,

  // ── PRESS OG KRAV ────────────────────────────────────────
  "gi meg": 25, "gir meg": 20, "send meg": 22, "sende meg": 22,
  "les opp": 22, "lese opp": 22, "lese til meg": 25, "les til meg": 25,
  "si meg": 20, "fortell meg": 18, "oppgi": 22,
  "eller så": 18, "eller sa": 18, "ellers": 10,
  "hvis ikke": 15, "du må": 15, "du maa": 15, "må du": 12,
  "med en gang": 18, "med engang": 18, "umiddelbart": 18,
  "fortløpende": 15, "fort som mulig": 22, "så fort": 15,
  "lukke saken": 15, "bekrefte": 20, "bekrefter": 20, "bekreft": 20,
  "verifisere": 22, "verifiser": 22,

  // ── KORTDETALJER / CVV / UTLØPSDATO ─────────────────────
  "tallene bak": 55, "tall bak": 55, "bak på kortet": 55, "baksiden av kortet": 55, "baksiden": 30,
  "tre sifrene": 50, "3 sifrene": 50, "tre sifre": 50, "3 sifre": 50,
  "siste tre": 50, "siste 3": 50, "tre tall": 40, "3 tall": 40,
  "sikkerhetskode": 50, "sikkerhetskoden": 50, "cvv": 50, "cvc": 50, "cv-kode": 50, "cv kode": 50,
  "tallene på kortet": 50, "tallene paa kortet": 50, "tallene foran": 45,
  "kortnummer": 50, "kortnummeret": 50, "kort nummer": 50,
  "framsiden": 45, "forsiden": 40, "tallene": 25, "nummeret": 15,
  "utløpsdato": 45, "utløpsdatoen": 45, "utlopsdato": 45, "gyldig til": 40, "gyldig fra": 25,
  "dato": 15, "datoen": 15, "måned": 10, "år": 5,
  "kortet ditt": 20, "kortet": 10, "kort": 5,
  "debetkort": 20, "visakort": 20, "visa": 10, "mastercard": 15,

  // ── BANKID ──────────────────────────────────────────────
  "bankid": 40, "bank id": 40, "bank-id": 40, "bankid-en": 40, "bankiden": 40,
  "bankid-kode": 45, "bankid kode": 45,
  "bankid-appen": 30, "bankid appen": 30, "bankidappen": 30,

  // ── BANK OG NETTBANK ─────────────────────────────────────
  "banken": 15, "banken din": 18, "bank": 8, "bankene": 10,
  "nettbank": 20, "nettbanken": 20, "nettbanken din": 22,
  "mobilbank": 18, "mobilbanken": 18,
  "dnb": 12, "nordea": 12, "sparebanken": 12, "sparebankene": 10,
  "handelsbanken": 12, "sbanken": 12,

  // ── PASSORD / KODE / PIN ─────────────────────────────────
  "passord": 30, "passordet": 30, "passordet ditt": 35, "passordene": 28,
  "pinkode": 35, "pinkoden": 35, "pin-kode": 35, "pin kode": 35, "pin": 25,
  "kode": 15, "koden": 15, "koden din": 20,
  "engangskode": 30, "engangskoden": 30, "sms-kode": 30, "sms kode": 30, "smskode": 30,
  "innlogging": 10, "innloggingen": 10, "logge inn": 10, "logge deg inn": 12,

  // ── SIKKERHET (misbruk som påskudd) ─────────────────────
  "sikkerhet": 10, "sikkerheten": 10, "sikkerhetsgrunn": 15,
  "sikkerhetssjekk": 18, "sikkerhetskontroll": 18,
  "sikkerhetskonto": 25, "sikker konto": 25,

  // ── PERSONNUMMER / FØDSELSNUMMER ─────────────────────────
  "personnummer": 40, "personnummeret": 40,
  "fødselsnummer": 40, "fødselsnummeret": 40, "fodselsnummer": 40,

  // ── FALSK AUTORITET ──────────────────────────────────────
  "ringer fra": 20, "ringer på vegne": 22, "på vegne av": 18,
  "politiet": 22, "politi": 18, "skatteetaten": 22, "skatt": 10,
  "inkasso": 25, "inkassobyrå": 25, "inkassobyra": 25, "inkassoselskap": 25,
  "microsoft": 20, "apple": 15, "lisens": 18, "lisensen": 18,
  "faktura": 15, "fakturaen": 15, "regning": 8, "regningen": 8, "vipps": 10,

  // ── KONTO OG OVERFØRING ──────────────────────────────────
  "konto": 15, "kontoen": 15, "kontoen din": 18,
  "kontonummer": 25, "kontonummeret": 25,
  "overføring": 28, "overføringen": 28, "overføre": 28, "overfore": 28,
  "kredittkort": 25, "kredittkortet": 25,
  "betale": 8, "betaling": 8, "betalingen": 8,
  "ikke betalt": 18, "ubetalt": 15, "ubetalte": 15, "utestående": 15,
  "skyldig": 12, "gjeld": 12, "gebyr": 10, "gebyret": 10, "premie": 15, "vunnet": 18,

  // ── HASTVERK OG BLOKKERING ───────────────────────────────
  "blokkert": 25, "blokkeres": 25, "sperret": 25, "sperres": 25,
  "stengt": 22, "stenges": 22, "fryst": 22, "fryses": 22,
  "haster": 22, "hastende": 22, "hacket": 22, "hacka": 22, "virus": 18,
  "misbrukt": 22, "misbruk": 20, "uautorisert": 22, "mistenkelig": 15,

  // ── FJERNKONTROLL-SVINDEL ────────────────────────────────
  "teamviewer": 45, "team viewer": 45, "anydesk": 45, "any desk": 45,
  "fjernkontroll": 40, "fjerntilgang": 40, "fjernhjelp": 30, "fjernstyring": 40,
  "installer": 15, "installere": 15, "laste ned": 12, "nedlasting": 12,

  // ── ARRESTASJON OG STRAFF ────────────────────────────────
  "arrest": 20, "arrestert": 22, "arrestere": 22,
  "straff": 18, "straffes": 18, "bot": 12, "bøte": 12,
  "anmelde": 15, "anmeldt": 15, "anmeldelse": 15,

  // ── INVESTERINGSSVINDEL ──────────────────────────────────
  "investere": 25, "investering": 25, "investeringen": 25, "investeringer": 25,
  "investor": 20, "investorer": 20, "investera": 25, "investerar": 25, "investeringa": 25,
  "finansiering": 22, "finansiere": 22, "finansier": 22,
  "finans": 15, "finanser": 15, "finansiell": 15, "finansielle": 15,
  "avkastning": 28, "avkastningen": 28, "avkastninga": 28,
  "gevinst": 22, "gevinsten": 22,
  "utbytte": 20, "utbyttet": 20,
  "profitt": 22, "profitten": 22,
  "fortjeneste": 22, "fortjenesten": 22, "fortjenesta": 22,
  "rente": 12, "rentene": 12, "renter": 12, "rentane": 12,
  "cagr": 30, "roi": 25,
  "margin": 12, "marginen": 12, "marginene": 12,
  "doble": 30, "dobling": 30, "dobler": 30, "dobla": 30, "doblet": 30,
  "doble pengene": 40, "dobling av penger": 40, "dobler pengene": 40,
  "triple": 30, "tripling": 30, "tripler": 30, "tripla": 30, "triplet": 30,
  "triple pengene": 40, "tripling av penger": 40, "tripler pengene": 40,
  "firedoble": 35, "tidoble": 35, "hundredoble": 40,
  "garantert": 30, "garanterer": 30, "garantert avkastning": 45, "garantert gevinst": 45,
  "risikofritt": 35, "risikofri": 35, "ingen risiko": 35,
  "sikker investering": 35, "sikker avkastning": 35,
  "fond": 15, "fondet": 15, "fondene": 15,
  "aksje": 15, "aksjer": 15, "aksjene": 15, "aksjen": 15,
  "portefølje": 18, "porteføljen": 18,
  "passiv inntekt": 28, "passiv inntekter": 28,
  "finansiell frihet": 25, "økonomisk frihet": 25,
  "tidsbegrenset": 22, "tidsbegrensa": 22, "begrenset tilbud": 25, "begrensa tilbud": 25,
  "eksklusivt": 18, "eksklusivt tilbud": 22,
  "kun i dag": 22, "bare i dag": 22,
  "pengane": 10, "pengene": 10, "penga": 10,
  "overføringa": 28, "overførsel": 28,
  "betalinga": 8, "gebyra": 10,

  // ── KRYPTOSVINDEL ────────────────────────────────────────
  "krypto": 25, "kryptovaluta": 28, "kryptoen": 25,
  "bitcoin": 25, "bitcoins": 25,
  "ethereum": 22, "eth": 18,
  "wallet": 20, "kryptowallet": 25, "krypto-wallet": 25, "krypto wallet": 25,
  "blockchain": 15, "blokkjede": 15,
  "token": 18, "tokens": 18, "tokenet": 18,
  "nft": 18, "mining": 18, "miner": 15, "minere": 15,
  "desentralisert": 12, "exchange": 18, "børs": 12, "børsen": 12,

  // ── TRADINGSVINDEL ───────────────────────────────────────
  "trading": 22, "trade": 18, "trader": 18, "tradere": 18,
  "megler": 18, "megleren": 18, "meglerfirma": 20,
  "handelsplattform": 22, "plattform": 15, "plattformen": 15,
  "algoritme": 18, "algoritmen": 18, "autotrading": 25,
  "bot trading": 25, "tradingbot": 25,
  "sett inn": 18, "sette inn": 18, "innskudd": 20, "innskuddet": 20,
  "minimumsbeløp": 25, "startbeløp": 22, "minsteinnskudd": 25,
};

// ============================================================
// KATEGORI-KART
// Mapper enkeltord til en bred, brukersynlig kategori.
// Bare disse kategoriene vises i telefon-UI-et.
// ============================================================
const WORD_TO_GROUP: Record<string, string> = {};

const GROUP_MAP: [string[], string][] = [
  [["tar livet","ta livet","drepe","dreper","drepte","skade deg","skader deg",
    "slå deg","slår deg","banke deg","banker deg","konsekvenser","angre","angre på",
    "arrest","arrestert","arrestere","straff","straffes","bot","bøte",
    "anmelde","anmeldt","anmeldelse"], "Trussel"],

  [["gi meg","gir meg","send meg","sende meg","les opp","lese opp","lese til meg",
    "les til meg","si meg","fortell meg","oppgi","eller så","eller sa","ellers",
    "hvis ikke","du må","du maa","må du","med en gang","med engang","umiddelbart",
    "fortløpende","fort som mulig","så fort","lukke saken","bekrefte","bekrefter",
    "bekreft","verifisere","verifiser"], "Press / Krav"],

  [["tallene bak","tall bak","bak på kortet","baksiden av kortet","baksiden",
    "tre sifrene","3 sifrene","tre sifre","3 sifre","siste tre","siste 3",
    "tre tall","3 tall","sikkerhetskode","sikkerhetskoden","cvv","cvc",
    "cv-kode","cv kode","tallene på kortet","tallene paa kortet","tallene foran",
    "kortnummer","kortnummeret","kort nummer","framsiden","forsiden","tallene",
    "nummeret","utløpsdato","utløpsdatoen","utlopsdato","gyldig til","gyldig fra",
    "dato","datoen","måned","år","kortet ditt","kortet","kort","debetkort",
    "visakort","visa","mastercard","kredittkort","kredittkortet"], "Bankdetaljer"],

  [["bankid","bank id","bank-id","bankid-en","bankiden",
    "bankid-kode","bankid kode","bankid-appen","bankid appen","bankidappen"], "Kritisk infrastruktur"],

  [["passord","passordet","passordet ditt","passordene","pinkode","pinkoden",
    "pin-kode","pin kode","pin","kode","koden","koden din","engangskode",
    "engangskoden","sms-kode","sms kode","smskode","innlogging","innloggingen",
    "logge inn","logge deg inn","sikkerhet","sikkerheten","sikkerhetsgrunn",
    "sikkerhetssjekk","sikkerhetskontroll","sikkerhetskonto","sikker konto",
    "personnummer","personnummeret","fødselsnummer","fødselsnummeret","fodselsnummer"], "Personlig info"],

  [["banken","banken din","bank","bankene","nettbank","nettbanken","nettbanken din",
    "mobilbank","mobilbanken","dnb","nordea","sparebanken","sparebankene",
    "handelsbanken","sbanken","konto","kontoen","kontoen din","kontonummer",
    "kontonummeret","overføring","overføringen","overføre","overfore","betale",
    "betaling","betalingen","ikke betalt","ubetalt","ubetalte","utestående",
    "skyldig","gjeld","gebyr","gebyret","premie","vunnet","vipps",
    "overføringa","overførsel","betalinga","gebyra"], "Økonomi"],

  [["ringer fra","ringer på vegne","på vegne av","politiet","politi",
    "skatteetaten","skatt","inkasso","inkassobyrå","inkassobyra","inkassoselskap"], "Utgir seg som autoritet"],

  [["microsoft","apple","lisens","lisensen","faktura","fakturaen","regning","regningen",
    "teamviewer","team viewer","anydesk","any desk","fjernkontroll","fjerntilgang",
    "fjernhjelp","fjernstyring","installer","installere","laste ned","nedlasting",
    "hacket","hacka","virus"], "Typisk svindel"],

  [["blokkert","blokkeres","sperret","sperres","stengt","stenges","fryst","fryses",
    "haster","hastende","misbrukt","misbruk","uautorisert","mistenkelig",
    "tidsbegrenset","tidsbegrensa","begrenset tilbud","begrensa tilbud",
    "eksklusivt","eksklusivt tilbud","kun i dag","bare i dag"], "Press / Hastverk"],

  [["investere","investering","investeringen","investeringer","investor","investorer",
    "investera","investerar","investeringa","finansiering","finansiere","finansier",
    "finans","finanser","finansiell","finansielle","avkastning","avkastningen",
    "avkastninga","gevinst","gevinsten","utbytte","utbyttet","profitt","profitten",
    "fortjeneste","fortjenesten","fortjenesta","rente","rentene","renter","rentane",
    "cagr","roi","margin","marginen","marginene","doble","dobling","dobler","dobla",
    "doblet","doble pengene","dobling av penger","dobler pengene","triple","tripling",
    "tripler","tripla","triplet","triple pengene","tripling av penger","tripler pengene",
    "firedoble","tidoble","hundredoble","garantert","garanterer","garantert avkastning",
    "garantert gevinst","risikofritt","risikofri","ingen risiko","sikker investering",
    "sikker avkastning","fond","fondet","fondene","aksje","aksjer","aksjene","aksjen",
    "portefølje","porteføljen","passiv inntekt","passiv inntekter",
    "finansiell frihet","økonomisk frihet","sett inn","sette inn","innskudd",
    "innskuddet","minimumsbeløp","startbeløp","minsteinnskudd"], "Investeringssvindel"],

  [["krypto","kryptovaluta","kryptoen","bitcoin","bitcoins","ethereum","eth",
    "wallet","kryptowallet","krypto-wallet","krypto wallet","blockchain","blokkjede",
    "token","tokens","tokenet","nft","mining","miner","minere","desentralisert",
    "exchange","børs","børsen"], "Krypto"],

  [["trading","trade","trader","tradere","megler","megleren","meglerfirma",
    "handelsplattform","plattform","plattformen","algoritme","algoritmen",
    "autotrading","bot trading","tradingbot"], "Tradingsvindel"],
];

// Bygg oppslags-tabell én gang ved oppstart
for (const [words, group] of GROUP_MAP) {
  for (const w of words) WORD_TO_GROUP[w] = group;
}

// ============================================================
// detectRisk — analyserer tekst og returnerer totalpoeng
// og hvilke risikogrupper som ble truffet
// ============================================================
function detectRisk(text: string): { risk: number; groups: string[] } {
  const lower = text.toLowerCase();
  let total = 0;
  const groups = new Set<string>();

  for (const [word, score] of Object.entries(RISK_WORDS)) {
    if (lower.includes(word)) {
      total += score;
      const g = WORD_TO_GROUP[word];
      if (g) groups.add(g);
    }
  }

  return { risk: total, groups: Array.from(groups) };
}

// ============================================================
// Fasetilstander for telefon-UI-et
// mic      → bruker gir mikrofon-tillatelse
// idle     → venter på samtale
// ringing  → telefonen ringer
// call     → aktiv samtale med sanntidsanalyse
// ended    → manuelt lagt på
// secured  → automatisk lagt på av TryggTale (70 % risiko)
// ============================================================
type Phase = "mic" | "idle" | "ringing" | "call" | "ended" | "secured";

export default function PhoneDemo() {
  const [phase, setPhase]               = useState<Phase>("mic");
  const [micDenied, setMicDenied]       = useState(false);
  const [totalRisk, setTotalRisk]       = useState(0);
  const [groups, setGroups]             = useState<string[]>([]);
  const [callDuration, setCallDuration] = useState(0);

  const recognitionRef = useRef<any>(null);
  const seenGroups     = useRef(new Set<string>());
  const riskRef        = useRef(0);            // synkron kopi av totalRisk for bruk i callbacks
  const timerRef       = useRef<any>(null);

  // Formater tid som MM:SS
  const fmtTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // Klokkeslett for statuslinje i telefon
  const now = () =>
    new Date().toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });

  // Be om mikrofon-tillatelse, gå deretter til idle → ringing
  const requestMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop()); // lukk strømmen igjen, bare sjekker tillatelse
      setPhase("idle");
    } catch {
      setMicDenied(true);
    }
  };

  // Etter 1,5 sek i idle begynner telefonen å ringe
  useEffect(() => {
    if (phase !== "idle") return;
    const t = setTimeout(() => setPhase("ringing"), 1500);
    return () => clearTimeout(t);
  }, [phase]);

  // Start aktiv samtale og sett i gang talegjenkjenning
  const startCall = () => {
    setPhase("call");
    setCallDuration(0);
    timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return; // nettleseren støtter ikke Web Speech API

    const rec = new SR();
    rec.lang            = "nb-NO";   // norsk bokmål
    rec.continuous      = true;      // lytt kontinuerlig, ikke bare én setning
    rec.interimResults  = true;      // fang opp ord midt i setning
    rec.maxAlternatives = 1;
    recognitionRef.current = rec;

    // Holder styr på hvilke ord som allerede er scoret i pågående interim-chunk,
    // slik at samme ord ikke telles dobbelt når interim-teksten vokser.
    let interimScored = new Set<string>();

    rec.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text    = event.results[i][0].transcript;
        const isFinal = event.results[i].isFinal;

        if (isFinal) {
          // Setningen er ferdig — score ord som ikke allerede ble fanget av interim
          const lower = text.toLowerCase();
          let addedRisk = 0;

          for (const [word, score] of Object.entries(RISK_WORDS)) {
            if (lower.includes(word) && !interimScored.has(word)) {
              addedRisk += score;
              const g = WORD_TO_GROUP[word];
              if (g && !seenGroups.current.has(g)) {
                seenGroups.current.add(g);
                setGroups(prev => [...prev, g]);
              }
            }
          }

          if (addedRisk > 0) {
            const next = Math.min(100, riskRef.current + addedRisk);
            riskRef.current = next;
            setTotalRisk(next);
          }

          // Nullstill interim-tracking for neste setning
          interimScored = new Set<string>();

          // Automatisk raccrocher ved 70 % risiko
          if (riskRef.current >= 70) hangupSecured(rec);

        } else {
          // Interim: fang opp risikord midt i setningen
          const lower = text.toLowerCase();
          let addedRisk = 0;

          for (const [word, score] of Object.entries(RISK_WORDS)) {
            if (interimScored.has(word)) continue;
            if (lower.includes(word)) {
              interimScored.add(word);
              addedRisk += score;
              const g = WORD_TO_GROUP[word];
              if (g && !seenGroups.current.has(g)) {
                seenGroups.current.add(g);
                setGroups(prev => [...prev, g]);
              }
            }
          }

          if (addedRisk > 0) {
            const next = Math.min(100, riskRef.current + addedRisk);
            riskRef.current = next;
            setTotalRisk(next);
            if (next >= 70) hangupSecured(rec);
          }
        }
      }
    };

    // Start på nytt automatisk hvis gjenkjenning stopper av seg selv
    rec.onend = () => {
      if (recognitionRef.current) try { rec.start(); } catch {}
    };
    rec.onerror = () => {};
    rec.start();
  };

  // Hjelpe-funksjon: automatisk raccrocher ved 70 %
  const hangupSecured = (rec: any) => {
    setPhase("secured");
    if (timerRef.current)   { clearInterval(timerRef.current); timerRef.current = null; }
    if (recognitionRef.current) { recognitionRef.current = null; rec.stop(); }
  };

  // Manuell avslutning
  const endCall = () => {
    setPhase("ended");
    if (timerRef.current)   { clearInterval(timerRef.current); timerRef.current = null; }
    if (recognitionRef.current) {
      const r = recognitionRef.current;
      recognitionRef.current = null;
      r.stop();
    }
  };

  // Tilbakestill alt til startskjerm
  const reset = () => {
    setPhase("mic");
    setTotalRisk(0);
    setGroups([]);
    setCallDuration(0);
    setMicDenied(false);
    seenGroups.current.clear();
    riskRef.current = 0;
  };

  // Farge på risikomåleren: grønn → gul → oransje → rød
  const getColor = (r: number) =>
    r < 20 ? "#4caf50" : r < 40 ? "#8bc34a" : r < 55 ? "#ffb74d" : r < 70 ? "#ff9800" : r < 85 ? "#f44336" : "#d50000";

  // Tekstlig statusmelding
  const getStatus = (r: number) =>
    r < 20 ? "Trygt" : r < 40 ? "Lav risiko" : r < 55 ? "Middels" : r < 70 ? "Høy risiko" : r < 85 ? "SVINDEL MISTENKT" : "SVINDEL OPPDAGET";

  const color = getColor(totalRisk);

  // SVG-sirkel-parametere for thermostat-gauge
  const RADIUS = 70;
  const circ   = 2 * Math.PI * RADIUS;
  const offset = circ - (totalRisk / 100) * circ;

  // ── iPhone-skall — delt wrapper for alle faser ──────────
  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div style={{
      width: 375, height: 812, background: "#000", borderRadius: 50,
      border: "4px solid #2a2a2a", overflow: "hidden", position: "relative",
      boxShadow: "0 0 0 2px #1a1a1a, 0 20px 60px rgba(0,0,0,0.5)",
      margin: "0 auto", flexShrink: 0,
    }}>
      {/* Dynamisk øy / notch */}
      <div style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: 160, height: 34, background: "#000", borderRadius: "0 0 20px 20px", zIndex: 10,
      }} />
      <div style={{
        height: "100%", display: "flex", flexDirection: "column",
        background: totalRisk >= 55
          ? "linear-gradient(180deg, #1a0505, #120202)"   // rødlig ved høy risiko
          : "linear-gradient(180deg, #0d0d12, #0a0a0f)",  // mørk blå-grå ellers
        transition: "background 0.5s",
      }}>
        {/* Statuslinje */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          padding: "14px 24px 0", fontSize: 12, fontWeight: 600, color: "#fff",
          position: "relative", zIndex: 5,
        }}>
          <span>{now()}</span>
          <span style={{ fontSize: 11 }}>5G &nbsp; 100%</span>
        </div>
        {children}
      </div>
    </div>
  );

  return (
    <div style={{ position: "relative" }}>
      <Shell>

        {/* ── MIKROFON-TILLATELSE ── */}
        {phase === "mic" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: "0 30px" }}>
            <div style={{ fontSize: 48 }}>🎤</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", textAlign: "center" }}>
              Tillat mikrofon for å starte
            </div>
            <div style={{ fontSize: 12, color: "#888", textAlign: "center", lineHeight: 1.5 }}>
              Mikrofonen brukes til talegjenkjenning under demoen. Ingen data lagres eller sendes.
            </div>
            {micDenied && (
              <div style={{ fontSize: 12, color: "#ef5350", textAlign: "center" }}>
                Mikrofontilgang nektet. Sjekk nettleserinnstillinger.
              </div>
            )}
            <button onClick={requestMic} style={{
              marginTop: 10, padding: "14px 32px", borderRadius: 30, border: "none",
              background: "linear-gradient(135deg, #4fc3f7, #81c784)", color: "#000",
              fontSize: 14, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 20px rgba(79,195,247,0.3)",
            }}>
              Tillat mikrofon
            </button>
          </div>
        )}

        {/* ── VENTER PÅ INNKOMMENDE SAMTALE ── */}
        {phase === "idle" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <div style={{ fontSize: 48, animation: "blink 1.5s infinite" }}>📱</div>
            <div style={{ fontSize: 14, color: "#888" }}>Venter på innkommende samtale...</div>
          </div>
        )}

        {/* ── INNKOMMENDE ANROP ── */}
        {phase === "ringing" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
            <div style={{
              width: 120, height: 120, borderRadius: "50%",
              border: "3px solid #333", animation: "ringPulse 1.5s infinite",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "linear-gradient(135deg, #ddd, #f5f0eb)",
            }}>
              <span style={{ fontSize: 56 }}>👵</span>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>Olga</div>
              <div style={{ fontSize: 14, color: "#888", marginTop: 2 }}>93 år · Mobil</div>
            </div>
            <div style={{ fontSize: 13, color: "#666", animation: "blink 1.5s infinite" }}>Ringer...</div>
            <div style={{ display: "flex", gap: 48, marginTop: 40 }}>
              {/* Avslå */}
              <button onClick={reset} style={{
                width: 64, height: 64, borderRadius: "50%", border: "none",
                background: "#e53935", color: "#fff", fontSize: 24, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ transform: "rotate(135deg)", display: "inline-block" }}>📞</span>
              </button>
              {/* Svar */}
              <button onClick={startCall} style={{
                width: 64, height: 64, borderRadius: "50%", border: "none",
                background: "#43a047", color: "#fff", fontSize: 24, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                animation: "ringPulse 1.5s infinite",
              }}>📞</button>
            </div>
            <div style={{ display: "flex", gap: 80, fontSize: 11, color: "#888", marginTop: 8 }}>
              <span>Avslå</span>
              <span>Svar</span>
            </div>
          </div>
        )}

        {/* ── AKTIV SAMTALE ── */}
        {phase === "call" && (
          <>
            {/* Callerinfo og varighet */}
            <div style={{ textAlign: "center", padding: "50px 20px 8px" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%", margin: "0 auto 10px",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "linear-gradient(135deg, #ddd, #f5f0eb)",
              }}>
                <span style={{ fontSize: 32 }}>👵</span>
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, color: "#fff" }}>Olga</div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
                {fmtTime(callDuration)}
              </div>
            </div>

            {/* Thermostat-gauge — viser risikonivå */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 20px" }}>
              <div style={{ position: "relative", width: 160, height: 160 }}>
                <svg viewBox="0 0 160 160" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                  {/* Bakgrunnssirkel */}
                  <circle cx="80" cy="80" r={RADIUS} fill="none" stroke="#1a1a2a" strokeWidth="10" />
                  {/* Risikoindikator */}
                  <circle cx="80" cy="80" r={RADIUS} fill="none" stroke={color} strokeWidth="10"
                    strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
                    style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.5s", filter: `drop-shadow(0 0 6px ${color})` }} />
                </svg>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                  <div style={{ fontSize: 38, fontWeight: 800, color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                    {Math.round(totalRisk)}%
                  </div>
                  <div style={{ fontSize: 9, color: "#666", textTransform: "uppercase", letterSpacing: 2, marginTop: 2 }}>Risiko</div>
                </div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color, marginTop: 4 }}>{getStatus(totalRisk)}</div>
            </div>

            {/* Oppdagede risikokategorier */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "8px 24px", justifyContent: "center" }}>
              {groups.map((g, i) => (
                <span key={i} style={{
                  padding: "4px 12px", borderRadius: 14, fontSize: 11, fontWeight: 600,
                  background: "rgba(239,83,80,0.12)", border: "1px solid rgba(239,83,80,0.25)",
                  color: "#ef5350",
                }}>{g}</span>
              ))}
            </div>

            <div style={{ flex: 1 }} />

            {/* Vis "legg på og rapporter"-knapp ved 50 %+ */}
            <div style={{ padding: "0 32px 12px" }}>
              {totalRisk >= 50 && (
                <button onClick={endCall} style={{
                  width: "100%", padding: "12px", borderRadius: 14, border: "none",
                  background: "rgba(239,68,68,0.15)", color: "#ef5350",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}>
                  Legg på og rapporter
                </button>
              )}
            </div>

            {/* Telefon-kontroller: demp / legg på / høyttaler */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 32, padding: "8px 20px 32px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                }}>🔇</div>
                <span style={{ fontSize: 9, color: "#666" }}>Mute</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <button onClick={endCall} style={{
                  width: 60, height: 60, borderRadius: "50%", border: "none",
                  background: "#e53935", color: "#fff", fontSize: 22, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ transform: "rotate(135deg)", display: "inline-block" }}>📞</span>
                </button>
                <span style={{ fontSize: 9, color: "#666" }}>Legg på</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                }}>🔊</div>
                <span style={{ fontSize: 9, color: "#666" }}>Høyttaler</span>
              </div>
            </div>
          </>
        )}

        {/* ── MANUELT LAGT PÅ ── */}
        {phase === "ended" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "0 30px" }}>
            <div style={{ fontSize: 13, color: "#888" }}>Samtale avsluttet &middot; {fmtTime(callDuration)}</div>
            <div style={{ fontSize: 42, fontWeight: 800, color, marginTop: 8 }}>{Math.round(totalRisk)}%</div>
            <div style={{ fontSize: 14, fontWeight: 600, color }}>{getStatus(totalRisk)}</div>
            {groups.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginTop: 8 }}>
                {groups.map((g, i) => (
                  <span key={i} style={{
                    padding: "3px 10px", borderRadius: 12, fontSize: 10, fontWeight: 600,
                    background: "rgba(239,83,80,0.1)", border: "1px solid rgba(239,83,80,0.2)", color: "#ef5350",
                  }}>{g}</span>
                ))}
              </div>
            )}
            <button onClick={reset} style={{
              marginTop: 24, padding: "12px 28px", borderRadius: 24, border: "1px solid #333",
              background: "#151520", color: "#4fc3f7", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>Prøv igjen</button>
          </div>
        )}

        {/* ── AUTOMATISK SIKRET AV TRYGGTALE (≥70 %) ── */}
        {phase === "secured" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "0 30px" }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "rgba(76,175,80,0.12)", border: "2px solid rgba(76,175,80,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36,
            }}>🛡️</div>

            <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", textAlign: "center", marginTop: 4 }}>
              Olga har lagt på
            </div>
            <div style={{ fontSize: 13, color: "#4caf50", fontWeight: 600, textAlign: "center" }}>
              Telefonen er sikret med TryggTale
            </div>
            <div style={{ fontSize: 11, color: "#888", textAlign: "center", marginTop: 8, lineHeight: 1.6 }}>
              Samtalen ble avsluttet etter {fmtTime(callDuration)} fordi mistenkelig aktivitet ble oppdaget.
            </div>

            {/* Oppdagede kategorier */}
            {groups.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginTop: 8 }}>
                {groups.map((g, i) => (
                  <span key={i} style={{
                    padding: "3px 10px", borderRadius: 12, fontSize: 10, fontWeight: 600,
                    background: "rgba(239,83,80,0.1)", border: "1px solid rgba(239,83,80,0.2)", color: "#ef5350",
                  }}>{g}</span>
                ))}
              </div>
            )}

            <div style={{
              marginTop: 16, padding: "10px 16px", borderRadius: 12,
              background: "rgba(76,175,80,0.08)", border: "1px solid rgba(76,175,80,0.15)",
              fontSize: 11, color: "#81c784", textAlign: "center", lineHeight: 1.5,
            }}>
              Ingen personlig informasjon ble delt. Samtalen ble ikke lagret.
            </div>

            <button onClick={reset} style={{
              marginTop: 20, padding: "12px 28px", borderRadius: 24, border: "1px solid #333",
              background: "#151520", color: "#4fc3f7", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>Prøv igjen</button>
          </div>
        )}

      </Shell>

      {/* Animasjoner for ringesignal og blinking */}
      <style>{`
        @keyframes ringPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(67,160,71,0.4); }
          50%       { box-shadow: 0 0 0 16px rgba(67,160,71,0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
