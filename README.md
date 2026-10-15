# Utstyrsutlån

En frontend-applikasjon i HTML, CSS og JavaScript, basert på bestilling.md, skjermbildene og den vedlagte modellen.

## Starte

Åpne `index.html` i en nettleser. Ingen installasjon eller bygging er nødvendig. Filene må ligge i samme mappe.

## Funksjonalitet

- Utstyrsoversikt med søk og status beregnet fra aktive utlån.
- Redigering av navn, kategori og beskrivelse.
- Personoversikt og registrering av nye personer.
- Utlån med person og dato, samt sperre mot dobbeltutlån.
- Innlevering og historikk for aktive og avsluttede utlån.
- Validering av obligatoriske felt, e-post og datoer.
- Lokal lagring i nettleseren. Ingen backend eller innlogging.

`model.js` er den opprinnelige modellen. `app.js` håndterer visninger, hendelser og oppdateringer av modellen. `style.css` styrer utseendet.

USB-headset starter som utlånt i samsvar med modellen. Skissene viser forskjellige tilstander i brukerflyten. Logg ut er utelatt fordi bestillingen uttrykkelig sier uten innlogging.

Lagringen gjelder nettleseren og adressen appen åpnes fra; data deles ikke mellom brukere eller enheter. Hvis nettleseren ikke tillater lokal lagring, vises en melding og appen fungerer videre i minnet.

## Kontrollert 15.10.2026

JavaScript-filene ble syntakskontrollert med Node. Følgende ble testet i nettleser via lokal HTTP-server:

- Søk uten hensyn til store/små bokstaver.
- Påkrevd person ved utlån.
- Registrering av utlån og visning under aktive utlån.
- Utlånt utstyr mangler Lån ut-knapp.
- Innlevering oppdaterer status og historikk.
- Registrering av ny person.
- Redigering av utstyr, og bevaring av endringer etter omlasting.
- Avbryt forkaster endringer.
- Ingen JavaScript-feil registrert i nettleserens logg.

Testene ble kjørt på en egen lokal adresse; den viste demoen bruker de opprinnelige eksempeldataene.
