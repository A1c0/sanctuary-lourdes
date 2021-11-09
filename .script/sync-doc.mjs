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

const toTypeTitle = s => `### ${s}`;

const apiDoc = getApiDoc (path.resolve (APP_DIR, 'index.mjs'));

const getDocTitle = S.pipe ([
  S.map (replace (/ *\/\/ */) ('')),
  S.joinWith ('\n'),
  Sl.firstGroupMatch (/#*\n#{5} {3}(.*) {3}#{5}\n#*/m),
  S.map (toCapitalize),
]);

const bob = x =>
  S.pipe ([
    getDocTitle,
    S.map (toTypeTitle),
    S.maybeToEither (x)
  ]) (x);

const toSummaryFormat = s => `- [${s}](#${s})`;

// docSummary :: String
const docSummary = S.pipe ([
  S.map (S.either (getDocTitle) (S.K (S.Nothing))),
  S.justs,
  S.map (toSummaryFormat),
  S.unlines,
]) (apiDoc);

const apiString = S.pipe ([
  S.map (S.map (defToString)),
  S.map (S.either (bob) (S.Right)),
  S.rights,
  S.joinWith ('\n\n'),
]) (apiDoc);

const readmePath = path.resolve (APP_DIR, 'README.md');

S.pipe ([
  readFile,
  S.lines,
  lines => S.take (S.fromMaybe (0) (Sl.indexOf ('## API') (lines))) (lines),
  S.fromMaybe ([]),
  S.append ('## API'),
  S.append (''),
  S.append (docSummary),
  S.append (''),
  S.append (apiString),
  S.unlines,
  writeFile (readmePath),
]) (readmePath);
