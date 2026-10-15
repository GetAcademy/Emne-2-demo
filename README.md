# Utstyrsutlån – Emne 2

Applikasjonen er skrevet på nytt fra bestillingen, skjermbildene, den ferdige modellen og dokumentet «Om Emne 2-måten å bygge en applikasjon».

## Åpne appen og testene

- Åpne `index.html` i en nettleser for å bruke appen.
- Åpne `tests/index.html` for å kjøre QUnit-testene.

Ingen installasjon, Node, npm eller bygging er nødvendig. QUnit ligger lokalt i `tests/vendor`, slik at testene også kan kjøres uten internett. Den midlertidige HTTP-serveren som ble brukt under kontrollen, er ikke del av appen.

Data ligger i minnet. Omlasting starter appen med eksempeldataene igjen. Den tidligere løsningens lokale lagring er fjernet.

## Filene og dataflyten

| Fil | Ansvar |
| --- | --- |
| `model.js` | Én global modell med app-state, arbeidsutkast og domenedata. |
| `helpers.js` | Små hjelpefunksjoner for ID-er, søk, utlånsstatus, dato og HTML-tegn. |
| `view.js` | `updateView()` velger side. Sidefunksjonene leser modellen og lager HTML. |
| `controller.js` | Brukerhandlinger validerer og endrer modellen, og kaller viewet. |
| `style.css` | Utseende og tilpasning til smale skjermer. |
| `tests/controllerTests.js` | QUnit-tester som kontrollerer modellen etter controller-kall. |

Eksempel på dataflyt: `startLoan(itemId)` fyller ut `model.viewState.loanPage`. Brukeren endrer utkastet gjennom inline-events. `registerLoan()` validerer utkastet, lager et nytt låneobjekt i `model.loans` og viser aktive utlån.

Et arbeidsutkast er aldri det samme objektet som lagrede domenedata. Avbryt navigerer bort uten å lagre. Når et skjema åpnes igjen, fylles et nytt utkast inn. Tilgjengelighet beregnes fra utlånene; status lagres ikke separat.

## Funksjonalitet og avklaringer

Appen har utstyrsoversikt, søk, redigering, personregistrering, utlån, innlevering og historikk. Søk utføres med Søk-knappen eller Enter. Controllerne avviser blant annet manglende felt, ukjente ID-er, dobbeltutlån og ugyldige datoer. E-postkontrollen er enkel og suppleres av HTML-feltet `type="email"`.

Startdataene følger den vedlagte modellen. Derfor er USB-headset utlånt ved oppstart, selv om én av skissene viser en annen tilstand. «Logg ut» er utelatt fordi bestillingen sier uten innlogging.

Den eneste utvidelsen av den vedlagte modellen er `model.app.message`, som inneholder valideringsmeldingen til brukeren.

## Kontrollert 15.10.2026

QUnit 2.24.1: **25 tester, 75 assertions, 0 feil**. Testene starter med ferske data før hver test, og bruker usorterte ID-er som er forskjellige fra array-indeksene. Viewet er erstattet med en tom `updateView()` i controller-testene.

Testene dekker navigasjon, søk, redigering, avbryt, registrering av personer, validering, separate objektreferanser, ID-generering, utlån, dobbeltutlån, innlevering, historikk og nytt utlån etter innlevering.

Manuelt kontrollert i nettleseren: søk med Enter, utlån med valgt person, innlevering, historikk, redigering av navn/kategori/beskrivelse og registrering av ny person. Ingen JavaScript-feil registrert i nettleserloggen. Startsiden er også visuelt kontrollert.

## Sluttkontroll mot Emne 2-dokumentet

- Én global modell. App-state, view state og domenedata er skilt.
- Relasjoner og controller-kall bruker ID-er.
- Status og søkeresultat beregnes ved behov.
- View-funksjonene lager HTML; de endrer ikke domenedata.
- Controllerne endrer modellen; de bygger ikke HTML.
- Arbeidsutkast kopieres felt for felt og skyves ikke direkte inn i domenelister.
- Vanlige funksjoner og løkker brukes til søk og gjennomgang av lister.
- HTML bygges med template strings og vises med `getElementById(...).innerHTML`.
- Hendelser er enkle inline-events.
- Ingen moduler, arrow functions, funksjonelle array-metoder, destructuring, spread, Object.assign, classes, asynkron kode, avansert DOM, rammeverk eller ekstra arkitektur i egen kode.
- Ingen Node-verktøy, avhengighetsinstallasjon eller byggesystem i prosjektet.
- QUnit-testene følger samme begrensede JavaScript-stil. Selve tredjepartsbiblioteket i `tests/vendor` er uendret QUnit-kode og inngår ikke i studentkoden.

QUnit er hentet fra den [offisielle distribusjonen](https://code.jquery.com/qunit/qunit-2.24.1.js). Lisensinformasjonen er beholdt i bibliotekfilene. Se også [QUnits dokumentasjon](https://qunitjs.com/intro/).
