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

* **string** `source` - start point coordinate on the format `x,y`
* **string** `target` - end point coordinate on the format `x,y`
* **number** `path_buffer` - route sensitivity / buffer (**default** `2000`)
* **number** `point_buffer` - point sensitivity / buffer (**default** `10`)
* **string** `bbox` - bbox bounding bounds on the format `x1,y1,x2,y2`
* **number** `limit` - max number of shortest path to return (**default** `1`)

Return shortest path from `source` to `target`. Returns a `GeometryCollection`
if a route is found.

**Returned route**

```json
{
  "type": "GeometryCollection",
  "geometries": [{
    "type": "LineString",
    "coordinates": [...],
    "properties": {
      "cost": 1510.05825002283
    }
  }]
}
```

**Mutliple routes**

If you want multiple shortest path you can use the `limit` query parameter to
control the number of routes returned. By default only the shortest route will
be returned.

```json
{
  "type": "GeometryCollection",
  "geometries": [{
    "type": "LineString",
    "coordinates": [...],
    "properties": {
      "cost": 1510.05825002283
    }
  },{
    "type": "LineString",
    "coordinates": [...],
    "properties": {
      "cost": 1610.06825002284
    }
  }]
}
```

**Route not found**

If the `source` or `target` points can not be found or a route between them
could not be found the routing will return an empty `GeometryCollection`.

```json
{
  "type": "GeometryCollection",
  "geometries": []
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

When starting the project for the first time, you'll see the following error while the database is
initialized.

```
/usr/src/app/index.js:73
    if (err) { throw err; }
               ^

Error: connect ECONNREFUSED 172.17.0.9:5432
    at Object.exports._errnoException (util.js:1034:11)
    at exports._exceptionWithHostPort (util.js:1057:20)
    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1096:14)
Program node index.js exited with code 1
```

Wait a few minutes for the init script to finish, and the node service to connect to Postgres.

```
Connected to Postgres Database
Server listening on port 8080
```

### Test

```
docker-compose run --rm node npm run test
docker-compose run --rm node npm run lint
```


## [MIT lisenced](https://github.com/Turistforeningen/Raido/blob/master/LICENSE)
