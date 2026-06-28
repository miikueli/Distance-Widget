# MiikuLive Distance Widget

Erillinen widget päivän aikana kuljetulle matkalle.

Näyttää:

`📍 Kuljettu tänään: 12.4 km`

Tämä EI korvaa sääwidgettiä. Tee tälle oma repo, esimerkiksi:

`Distance-Widget`

## Tiedostot

Lataa GitHub-repoon nämä tiedostot:

- index.html
- style.css
- script.js
- README.md

## GitHub Pages

Settings → Pages → Deploy from a branch → main → /root → Save

Osoite on sen jälkeen esimerkiksi:

`https://miikueli.github.io/Distance-Widget/`

## Testaus

Demo ilman GPS:ää:

`?demo=true`

Oikea GPS-versio:

avaa pelkkä osoite ilman parametreja.

Nollaa päivän matka:

`?reset=true`

Kun matka on nollattu, poista `?reset=true`, muuten se nollaa aina uudestaan.

Pieni versio:

`?size=small`

Vasen alanurkka:

`?position=left`

Yläreuna:

`?position=top`

Oma teksti:

`?label=Matka:`

## IRL Pro

Muista:

IRL Pro → Allow web overlays to access location → päälle

Android:
Asetukset → Sovellukset → IRL Pro → Käyttöoikeudet → Sijainti
