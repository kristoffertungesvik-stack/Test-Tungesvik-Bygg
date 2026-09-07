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
2. **GitHub-synk av prosjekter (valgfritt, men anbefalt).** Selve
   kunde-/prosjektlisten (de lagrede bestillingene) kan i tillegg synkroniseres
   til en fil (`data/projects.json`) i GitHub-repoet ditt. Da finner du
   prosjektene igjen uansett hvilken PC eller mobil du åpner siden fra.

   Uten dette oppsettet er prosjektene kun tilgjengelige på den ene
   enheten/nettleseren du lagret dem i. Prislistene og bestillingen du jobber
   med akkurat nå, synkroniseres ikke – kun selve prosjektlisten («Kunder» i
   venstremenyen).

### Sette opp GitHub-synk

1. Åpne appen, og trykk på tannhjulet ⚙ øverst til høyre i «Kunder»-panelet.
2. Lag et **fine-grained personal access token** på GitHub:
   - Gå til github.com → bildet ditt øverst til høyre → **Settings** →
     **Developer settings** (nederst i menyen til venstre) → **Personal access
     tokens → Fine-grained tokens** → **Generate new token**.
   - Under **Repository access** velger du **Only select repositories** og
     velger repoet du la appen i (f.eks. `tungesuik-nobb`).
   - Under **Permissions → Repository permissions** setter du **Contents** til
     **Read and write**. Du trenger ikke gi noen andre rettigheter.
   - Sett gjerne en utløpsdato (f.eks. 1 år), og trykk **Generate token**.
   - Kopier tokenet (starter med `github_pat_…`) – det vises kun én gang.
3. Lim tokenet inn i innstillingene i appen, sammen med:
   - **GitHub-brukernavn/organisasjon** (eieren av repoet)
   - **Repository-navn** (f.eks. `tungesuik-nobb`)
   - **Branch** (som regel `main`)
   - **Filsti for prosjektdata** (kan stå som `data/projects.json`)
4. Trykk **Lagre og synkroniser**. Appen oppretter filen automatisk første
   gang, og statuslinjen i sidepanelet viser om synken lykkes.
5. Gjenta steg 3–4 på hver enhet/nettleser du vil bruke appen fra, med samme
   token (eller lag ett token per enhet – valgfritt).

Etter dette synkroniseres prosjektlisten automatisk hver gang du lagrer eller
sletter en bestilling, når du åpner appen, og når du bytter tilbake til fanen.
Du kan også trykke på statuslinjen i sidepanelet for å synkronisere manuelt.

**Viktig om sikkerhet:** Tokenet lagres kun lokalt i nettleseren din
(`localStorage`) og sendes direkte fra nettleseren til GitHub – aldri til
noen tredjepart. Fordi appen ligger på en offentlig GitHub Pages-side, kan
hvem som helst besøke siden, men uten sitt eget gyldige token kan de ikke
lese eller skrive noe. Del likevel aldri tokenet ditt med andre, og bruk et
token som er avgrenset til kun dette ene repoet (som beskrevet over) – ikke
et token med tilgang til alle repoene dine. Ønsker du å trekke tilbake
tilgangen, sletter du tokenet på github.com, eller trykker «Koble fra» i
innstillingene i appen.

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
   `data/`-mappen, `README.md`) til repositoryet.
   - Enklest via nettleseren: åpne repoet → **Add file → Upload files** → dra
     inn filene/mappene → **Commit changes**.
3. Slå på GitHub Pages:
   - Gå til **Settings → Pages** i repositoryet.
   - Under **Build and deployment** velger du **Deploy from a branch**.
   - Velg branch `main` og mappe `/ (root)` → **Save**.
   - Etter ca. ett minutt får du en lenke i stil med
     `https://<brukernavn>.github.io/tungesuik-nobb/`.
4. Legg lenken i bokmerker på PC-en/mobilen du bruker.
5. Sett opp GitHub-synk som beskrevet over, på hver enhet du bruker.

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
                                    (holdes oppdatert av appen selv via
                                    GitHub-synken – du trenger ikke redigere
                                    den manuelt)
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
