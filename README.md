![Raidō](https://raw.githubusercontent.com/Turistforeningen/Raido/master/assets/raido.png "Raidō")

[![Build status](https://app.wercker.com/status/2ba1a86eacf6eb53f2efb58507f5de74/s "wercker status")](https://app.wercker.com/project/bykey/2ba1a86eacf6eb53f2efb58507f5de74)
[![Codacy grade](https://img.shields.io/codacy/grade/c1cc2fb578a44622b1712f65163bb1c5.svg "Codacy grade")](https://www.codacy.com/app/starefossen/Raido)
[![Codacy coverage](https://img.shields.io/codacy/coverage/c1cc2fb578a44622b1712f65163bb1c5.svg "Codacy coverage")](https://www.codacy.com/app/starefossen/Raido)
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

## API

### GET /v1/routing

* **string** `cords` - A to B coordinates on the format `x1,y1,x2,y2`
* **number** `sensitivity` - routing sensitivity / buffer (**default** `2000`)

Return the shortest path from coordinate A to coordinate B. Will return a
`GeometryCollection` if a route is found.

**Return**

```json
{
  "type": "GeometryCollection",
  "geometries": [{
    "type": "LineString",
    "coordinates": [...],
    "properties": {
      cost: 1510.05825002283
    }
  }]
}
```

**Route not found**

If the point A or B can not be found or a route between them could not be
found the routing will return a `LineString` between the two points.

```json
{
  "type": "LineString",
  "coordinates": [
    [ 8.922786712646484, 61.5062387475475 ],
    [ 8.97857666015625, 61.50984184413987 ]
  ]
}
```

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
