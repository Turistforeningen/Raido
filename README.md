![Raidō](https://raw.githubusercontent.com/Turistforeningen/Raido/master/assets/raido.png "Raidō")

[![Build status](https://app.wercker.com/status/2ba1a86eacf6eb53f2efb58507f5de74/s "wercker status")](https://app.wercker.com/project/bykey/2ba1a86eacf6eb53f2efb58507f5de74)
[![Codacy](https://img.shields.io/codacy/c1cc2fb578a44622b1712f65163bb1c5.svg "Codacy")](https://www.codacy.com/app/starefossen/Raido)
[![NPM downloads](https://img.shields.io/npm/dm/raido.svg "NPM downloads")](https://www.npmjs.com/package/raido)
[![NPM version](https://img.shields.io/npm/v/raido.svg "NPM version")](https://www.npmjs.com/package/raido)
[![Node version](https://img.shields.io/node/v/raido.svg "Node version")](https://www.npmjs.com/package/raido)
[![Dependency status](https://img.shields.io/david/Turistforeningen/Raido.svg "Dependency status")](https://david-dm.org/Turistforeningen/Raido)

Microservice for shortest path routing on Norwegian trails using
[pgRouting](https://github.com/Starefossen/docker-pgrouting) and waymarked
trails from the Norwegian Mapping Authority
([Kartverket](http://www.kartverket.no/en/Maps--Nautical-Charts/)).

The name Raidō means "ride, journey" in the runic alphabets is the reconstructed
Proto-Germanic name of the r- rune of the Elder Futhark ᚱ. The name is attested
for the same rune in all three rune poems, Old Norwegian Ræið Icelandic Reið,
Anglo-Saxon Rad.

> ᚱ Ræið kveða rossom væsta;
> Reginn sló sværðet bæzta.

## Production

```
docker run --name postgres turistforeningen/pgrouting-n50:latest
docker run --link postgres turistforeningen/raido:latest -p 8080
```

## Development

### Requirements

* Docker 1.10+
* Docker Compose v1.4+

### Start

```
docker-compose up
```

### Test

```
docker-compose run --rm node npm run test
docker-compose run --rm node npm run lint
```


## [MIT lisenced](https://github.com/Turistforeningen/Raido/blob/master/LICENSE)
