import 'zone.js/dist/zone-node';
import 'reflect-metadata';

import {renderModuleFactory} from '@angular/platform-server';
import {enableProdMode} from '@angular/core';
import * as express from 'express';
import {join} from 'path';
import {readFileSync} from 'fs';

enableProdMode();

const app = express();
const PORT = process.env.PORT || 4000;
const DIST_FOLDER = join(process.cwd(), 'dist');
const APP_FOLDER = 'browser';
const DIST_APP_FOLDER = join(DIST_FOLDER, APP_FOLDER);
const INDEX_FILE = join(DIST_APP_FOLDER, 'index.html');
const template = readFileSync(INDEX_FILE).toString();

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
const {AppServerModuleNgFactory, LAZY_MODULE_MAP} = require('./dist/server/main');
const {provideModuleMap} = require('@nguniversal/module-map-ngfactory-loader');

app.engine('html', (_, options, callback) => {
  renderModuleFactory(AppServerModuleNgFactory, {
    document: template,
    url: options.req.url,
    extraProviders: [
      provideModuleMap(LAZY_MODULE_MAP)
    ]
  }).then(html => {
    callback(null, html);
  });
});

app.set('view engine', 'html');
app.set('views', DIST_APP_FOLDER);

// serve static files
app.get('*.*', express.static(DIST_APP_FOLDER));
// serve all routes
app.get('*', (req, res) => {
  res.render(INDEX_FILE, {req});
});

app.listen(PORT, () => {
  console.log(`Node server listening on http://localhost:${PORT}`);
});

