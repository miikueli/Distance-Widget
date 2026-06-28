# MiikuLive Distance Widget — shared reset korjaus

Tämä versio korjaa erillisen nollausnapin toimintaa.

Ongelma vanhassa:
- Reset-nappi nollasi localStoragen.
- Varsinainen matka-widget ei välttämättä huomannut muutosta lennosta.

Korjaus:
- Reset-nappi kirjoittaa reset-komennon localStorageen.
- Matka-widget tarkistaa reset-komennon 0,5 sekunnin välein.
- Lisäksi mukana BroadcastChannel, jos selain/WebView tukee sitä.

## Lataa Distance-Widget-repoon

Korvaa vanhat:

- index.html
- style.css
- script.js

Lisää tai korvaa reset-napin tiedostot:

- reset-button.html
- reset-button.css
- reset-button.js

## Osoitteet

Matka-widget:

`https://miikueli.github.io/Distance-Widget/`

Reset-nappi:

`https://miikueli.github.io/Distance-Widget/reset-button.html`

Pieni reset-nappi:

`https://miikueli.github.io/Distance-Widget/reset-button.html?size=small`

## Jos nappi ei vieläkään toimi

Silloin IRL Pro saattaa ajaa eri browser overlayt täysin erillisissä muistialueissa.
Siinä tapauksessa reset-nappi pitää olla samassa widgetissä tai tarvitaan pieni serveri.
