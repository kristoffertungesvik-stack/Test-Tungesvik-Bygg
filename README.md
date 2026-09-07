# NOBB-oppslag – Tungesuik Bygg

Enkel, nettleserbasert app for å slå opp varer/priser (NOBB, Visma-prisliste m.m.),
bygge en bestilling, og lagre den per kunde/prosjekt slik at du kan finne den igjen
senere – også fra andre enheter.

Appen er én enkelt fil (`index.html`) – ingen server, ingen installasjon. Den
kjører rett i nettleseren, og lagrer prosjektene dine i en fil i GitHub-repoet
du legger appen i.

## Hvordan lagringen fungerer

Det er to lag med lagring:

1. **Lokalt i nettleseren (alltid på).** Prosjekt, prislister, gjeldende
   bestilling m.m. lagres i nettleserens `localStorage`, slik at ingenting
   forsvinner om du lukker fanen.
2. **Prosjekt-synk (valgfritt, men anbefalt).** Selve kunde-/prosjektlisten
   (de lagrede bestillingene) kan i tillegg synkroniseres til en fil
   (`data/projects.json`) i GitHub-repoet ditt, via en liten «synk-tjener»
   (en gratis Cloudflare Worker). Da finner du prosjektene igjen uansett
   hvilken PC eller mobil du åpner siden fra – og de som bruker appen trenger
   bare en delt PIN-kode, ikke tilgang til GitHub-repoet ditt.

   Uten dette oppsettet er prosjektene kun tilgjengelige på den ene
   enheten/nettleseren du lagret dem i. Prislistene og bestillingen du jobber
   med akkurat nå, synkroniseres uansett ikke – kun selve prosjektlisten
   («Kunder» i venstremenyen).

### Hvorfor en synk-tjener, og ikke bare et GitHub-token i appen?

Nettsiden er offentlig og koden er synlig for alle som besøker den. Et
GitHub-token limt rett inn i appen ville vært synlig for hvem som helst på
internett, ikke bare dine ansatte – de kunne da lese/endre/slette i
GitHub-repoet ditt. Løsningen er en liten mellomstasjon (synk-tjeneren) som
holder det ekte GitHub-tokenet skjult på serversiden. Appen kjenner bare en
enkel, delt PIN-kode – den gir kun tilgang til å lese/skrive prosjektlisten,
ingenting annet.

### 1. Sette opp synk-tjeneren (gjør du selv, én gang)

Dette gjøres via Cloudflare, som har et gratis nivå som er mer enn nok her
(100 000 forespørsler/dag – appen bruker en brøkdel av det).

1. Opprett en gratis konto på [dash.cloudflare.com](https://dash.cloudflare.com)
   om du ikke har en.
2. I menyen til venstre: **Workers & Pages → Create → Create Worker**. Gi den
   et navn, f.eks. `tungesuik-nobb-sync` → **Deploy** (den lager først et
   tomt eksempel-script, det ordner vi i neste steg).
3. Trykk **Edit code**. Slett innholdet som ligger der, og lim inn hele
   innholdet fra `sync-worker/worker.js` (følger med i denne leveransen).
   Trykk **Save and deploy**.
4. Gå til **Settings → Variables and Secrets** for Workeren, og legg til
   følgende (marker de tre første som **Secret**, ikke vanlig variabel):
   - `SYNC_PIN` (Secret) – PIN-koden appen/de ansatte skal bruke, f.eks. en
     litt lengre frase som `TungesuikBygg2026!`, ikke bare 4 tall.
   - `GITHUB_TOKEN` (Secret) – et **fine-grained personal access token** fra
     GitHub. Lag det på github.com → bildet ditt øverst til høyre →
     **Settings → Developer settings → Personal access tokens →
     Fine-grained tokens → Generate new token**. Under **Repository access**
     velger du **Only select repositories** og velger repoet ditt (f.eks.
     `tungesuik-nobb`). Under **Permissions → Repository permissions**
     setter du **Contents** til **Read and write**. Kopier tokenet – det
     vises kun én gang.
   - `GITHUB_OWNER` – GitHub-brukernavnet/organisasjonen som eier repoet.
   - `GITHUB_REPO` – repository-navnet (f.eks. `tungesuik-nobb`).
   - `GITHUB_BRANCH` – valgfri, `main` brukes automatisk om denne mangler.
   - `GITHUB_PATH` – valgfri, `data/projects.json` brukes automatisk om
     denne mangler.
   - `ALLOWED_ORIGIN` – valgfri, f.eks. `https://<brukernavn>.github.io`.
     Rent kosmetisk/høflig strupe på hvilken nettside som får kalle
     Workeren – det er PIN-koden som faktisk beskytter dataene.
5. Lagre. Kopier Worker-adressen øverst på siden (noe i stil med
   `https://tungesuik-nobb-sync.<ditt-cloudflare-brukernavn>.workers.dev`).

Denne adressen og PIN-koden er det eneste de ansatte trenger.

### 2. Ta appen i bruk (for deg og de ansatte)

1. Åpne appen, og trykk på tannhjulet ⚙ øverst til høyre i «Kunder»-panelet.
2. Lim inn **synk-adressen** (fra steg 5 over) og **PIN-koden**
   (`SYNC_PIN`-verdien du satte).
3. Trykk **Lagre og synkroniser**. Statuslinjen i sidepanelet viser om det
   lykkes.
4. Gjenta på hver enhet/nettleser som skal ha tilgang til prosjektene, med
   samme adresse og PIN-kode.

Etter dette synkroniseres prosjektlisten automatisk hver gang noen lagrer
eller sletter en bestilling, når appen åpnes, og når man bytter tilbake til
fanen. Du kan også trykke på statuslinjen for å synkronisere manuelt.

**Del PIN-koden kun med folk i firmaet.** Den gir tilgang til å lese og
endre prosjektlisten. Vil du fjerne tilgangen for alle (f.eks. ved mistanke
om at PIN-koden er kommet på avveie), endrer du bare `SYNC_PIN` i Cloudflare
og gir ut den nye koden på nytt.

### Hva om to personer lagrer samtidig?

Appen slår sammen prosjektlistene automatisk (nyeste endring vinner per
prosjekt), og prøver på nytt automatisk hvis to lagringer skjer i praksis
samtidig. For en enkeltmanns-/liten bedrift-bruk i denne størrelsesordenen er
dette mer enn godt nok.

## Legge ut på GitHub

1. Opprett et nytt repository på GitHub (f.eks. `tungesuik-nobb`). Det kan
   være privat eller offentlig – GitHub Pages funker med begge (privat krever
   GitHub Pro/Team/Enterprise for Pages; offentlig er gratis).
2. Last opp innholdet i denne mappen (`index.html`, `assets/`-mappen,
   `data/`-mappen, `README.md`) til repositoryet. `sync-worker/`-mappen
   trenger du ikke laste opp hit – den limes inn i Cloudflare i stedet (se
   eget steg over), men kan godt bli med for å ha koden samlet.
   - Enklest via nettleseren: åpne repoet → **Add file → Upload files** → dra
     inn filene/mappene → **Commit changes**.
3. Slå på GitHub Pages:
   - Gå til **Settings → Pages** i repositoryet.
   - Under **Build and deployment** velger du **Deploy from a branch**.
   - Velg branch `main` og mappe `/ (root)` → **Save**.
   - Etter ca. ett minutt får du en lenke i stil med
     `https://<brukernavn>.github.io/tungesuik-nobb/`.
4. Legg lenken i bokmerker på PC-en/mobilen du bruker.
5. Sett opp synk-tjeneren og PIN-koden som beskrevet over, på hver enhet du
   bruker.

Når du senere vil oppdatere appen (nye funksjoner, rettelser), laster du bare
opp en ny `index.html` til samme repository (eller bruker `git push` om du er
komfortabel med det), så oppdaterer GitHub Pages seg automatisk i løpet av
et minutt. Dette påvirker ikke `data/projects.json` – prosjektene dine
ligger trygt i sin egen fil.

## Mappestruktur

```
index.html                       – hele appen
assets/tungesuik-bygg-logo.png   – logo i toppen av appen og på tilbud
assets/favicon-16.png            – faviconer (fanikon i nettleser)
assets/favicon-32.png
assets/favicon-180.png           – til «legg til på hjemskjerm» (mobil)
assets/favicon-512.png
data/projects.json               – lagrede kunde-/prosjektbestillinger
                                    (holdes oppdatert av synk-tjeneren – du
                                    trenger ikke redigere den manuelt)
sync-worker/worker.js            – koden for synk-tjeneren (limes inn i
                                    Cloudflare, se eget steg over – er ikke
                                    en del av selve nettsiden/GitHub Pages)
```

## Andre prislister

Du kan fortsatt dra inn `.xlsx`-filer fra andre leverandører direkte i appen
(dropsonen under «Prislister») – de lagres lokalt i nettleseren, sammen med
Visma-prislisten som allerede ligger innebygget i appen. Prislister
synkroniseres ikke via GitHub (kun selve prosjektlisten gjør det).

## Tilbud og ordreliste

Under bestillingen finner du to knapper for utskrift/PDF:

- **Tilbud** – pent, kundevendt dokument med priser, tilbudsnummer og
  gyldighetsdato. Til å sende til kunde.
- **Ordreliste** – funksjonelt internt arbeidsdokument uten pris, gruppert
  per leverandør/prisliste med avkryssingsbokser til plukking, og
  signaturfelt nederst.

Begge åpnes i et nytt vindu med en «Skriv ut / Lagre som PDF»-knapp, som
bruker nettleserens innebygde utskriftsfunksjon.
