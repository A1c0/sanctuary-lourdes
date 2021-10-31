import path from 'path';

import {debug} from './debug.mjs';
import {APP_DIR, readFile, S, Sl, writeFile} from './utils.mjs';
import {getApiDoc} from './common.mjs';

const buildUrl = index =>
  `https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L${S.add(1)(
    index
  )}`;

const buildExemples = e => ['```js', e, '```'].join ('\n');

const defToString = ({index, title, meta, exemples}) =>
  [
    `#### <a href="${buildUrl(index)}">\`${title}\`</a>`,
    meta,
    buildExemples (exemples),
  ].join ('\n\n');

const toTextFormat = S.pipe ([
  S.map (defToString),
  S.joinWith ('\n\n')
]);

const apiString = S.pipe ([
  getApiDoc,
  toTextFormat
]) (path.resolve (APP_DIR, 'index.mjs'));

const readmePath = path.resolve (APP_DIR, 'README.md');

S.pipe ([
  readFile,
  S.lines,
  lines => S.take (S.fromMaybe (0) (Sl.indexOf ('## API') (lines))) (lines),
  S.fromMaybe ([]),
  S.append ('## API'),
  S.append (''),
  S.append (apiString),
  S.append (''),
  debug ('toto'),
  S.unlines,
  writeFile (readmePath),
]) (readmePath);
