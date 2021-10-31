import path from 'path';
import {APP_DIR, readFile, replace, S, Sl, writeFile} from './utils.mjs';
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

const toCapitalize = s => `${s[0].toUpperCase()}${s.slice(1).toLowerCase()}`;

const toTypeTitle = S.pipe ([
  toCapitalize,
  s => `### ${s}`
]);

const bob = x =>
  S.pipe ([
    S.map (replace (/ *\/\/ */) ('')),
    S.joinWith ('\n'),
    Sl.firstGroupMatch (/#*\n#{5} {3}(.*) {3}#{5}\n#*/m),
    S.map (toTypeTitle),
    S.maybeToEither (x),
  ]) (x);

const apiString = S.pipe ([
  getApiDoc,
  S.map (S.map (defToString)),
  S.map (S.either (bob) (S.Right)),
  S.rights,
  S.joinWith ('\n\n'),
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
  S.unlines,
  writeFile (readmePath),
]) (readmePath);
