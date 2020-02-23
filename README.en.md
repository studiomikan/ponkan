# Ponkan3

<p align="center">
  <img src="images/ponkan3-logo.png" alt="Ponkan3 logo" width="150">
</p>

Ponkan3 is novel-game-engine for web.

Languages: [Japanease](./README.md)

## Demo (sample game)

[Ponkan3 sample game (jp)](http://studiomikan.github.io/ponkan3-samplegame)

## Documents

[Ponkan3 Documents](http://studiomikan.github.io/ponkan3-docs)

## Build

```bash
# Install packages
$ npm install

# Run develop server.
# open http://localhost:8080/
$ npm start

# Run test server.
# Open http://localhost:8080/dist_test/test.html
$ npm run start-test

# Run test with headless chrome.
# (Requires Google Chrome.)
$ npm test

# Release build (to dist directory)
$ npm run build
```

## Docker

```bash
$ docker-compose build

# Run develop server.
# Open http://localhost:8080/
$ docker-compose up

# Launch container only. (do not start server.)
$ MANUAL=1 docker-compose up
```

## Browser Support

- Current active support
  - Google Chrome (latest)
- TODO:
  - Firefox (latest)
  - Edge (latest)

## External Libraries used by Ponkan3

### Libraries

- [PixiJS](https://github.com/pixijs/pixi.js) is licensed under the [MIT License](https://opensource.org/licenses/MIT)
- [HOWLER.js](https://github.com/goldfire/howler.js) is licensed under the [MIT License](https://opensource.org/licenses/MIT)
- [Web Font Loader](https://github.com/typekit/webfontloader) is licensed under the [Apache License, Version 2.0](https://opensource.org/licenses/Apache-2.0)
  - Web Font Loader Copyright (c) 2010-2017 Adobe Systems Incorporated, Google Incorporated.

### Fonts

- [GenShinGothic](http://jikasei.me/font/genshin/) is licensed under [SIL Open Font License 1.1](http://scripts.sil.org/OFL)
  - © 2015 自家製フォント工房, © 2014, 2015 Adobe Systems Incorporated, © 2015 M+ FONTS PROJECT

## License

Ponkan3 is licensed under the [MIT License](https://opensource.org/licenses/MIT).
