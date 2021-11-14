import path from 'path';

import {getApiDoc} from './common.mjs';
import {debug} from './debug.mjs';
import {APP_DIR, S, Sl, readFile, replace, writeFile} from './utils.mjs';

const buildUrl = index =>
  `https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L${S.add(1)(
    index
  )}`;

const buildExamples = e => ['```js', e, '```'].join ('\n');

const defToString = ({index, title, meta, examples}) =>
  [
    `#### <a href="${buildUrl(index)}">\`${title}\`</a>`,
    meta,
    buildExamples (examples),
  ].join ('\n\n');

const toCapitalize = s => `${s[0].toUpperCase()}${s.slice(1).toLowerCase()}`;

const toTypeTitle = s => `### ${s}`;

const apiDoc = getApiDoc (path.resolve (APP_DIR, 'index.mjs'));

//    removeCommentMarkerAndJoin :: Array String -> String
const removeCommentMarkerAndJoin = S.pipe ([
  S.map (replace (/ *\/\/ */) ('')),
  S.joinWith ('\n'),
]);

//    getDocTitle :: Array String -> Maybe String
const getDocTitle = S.pipe ([
  removeCommentMarkerAndJoin,
  Sl.firstGroupMatch (/#*\n#{5} {3}([A-Za-z]+) {3}#{5}\n#*/),
  S.map (toCapitalize),
]);

//    getFormattedTitle :: Array String -> Maybe String
const getFormattedTitle = S.pipe ([
  getDocTitle,
  S.map (toTypeTitle)
]);

//    getFormattedDescription :: Array String -> Maybe String
const getFormattedDescription = S.pipe ([
  removeCommentMarkerAndJoin,
  Sl.firstGroupMatch (/#*\n#{5} {3}[A-Za-z]+ {3}#{5}\n#*\n\n(.*(\n.*)*)/),
  S.map (Sl.replace (/\n/g) (' ')),
]);

//    getFormattedTitleAndDescription :: Array String -> Maybe String
const getFormattedTitleAndDescription = S.pipe ([
  S.flip ([getFormattedTitle, getFormattedDescription]),
  S.justs,
  Sl.toMaybe (array => array.length !== 0),
  S.map (S.joinWith ('\n\n')),
]);

//    extractWantedDoc :: Array String -> Either Array String String
const extractWantedDoc = x =>
  S.pipe ([
    getFormattedTitleAndDescription,
    S.maybeToEither (x)
  ]) (x);

const toSummaryFormat = s => `- [${s}](#${s})`;

//    docSummary :: String
const docSummary = S.pipe ([
  S.map (S.either (getDocTitle) (S.K (S.Nothing))),
  S.justs,
  S.map (toSummaryFormat),
  S.unlines,
]) (apiDoc);

//    apiString :: String
const apiString = S.pipe ([
  S.map (S.map (defToString)),
  S.map (S.either (extractWantedDoc) (S.Right)),
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
