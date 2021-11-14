import {create} from '../index.mjs';
import {env as flutureEnv} from 'fluture-sanctuary-types';
import * as fs from 'fs';
import path from 'path';
import sanctuary from 'sanctuary';
import {fileURLToPath} from 'url';

const S = sanctuary.create ({
  checkTypes: true,
  env: sanctuary.env.concat (flutureEnv),
});

const Sl = create ({
  checkTypes: true,
});

const __dirname = path.dirname (fileURLToPath (import.meta.url));
const APP_DIR = path.dirname (__dirname);

const readFile = x => S.pipe ([
  fs.readFileSync,
  S.show
]) (x);

const writeFile = S.curry2 (fs.writeFileSync);

const bob = acc => value => {
  const last = S.last (acc);
  if (S.isNothing (last)) {
    return S.append ([value]) (acc);
  }
  if (S.test (/::/) (value)) {
    return S.append ([value]) (acc);
  }
  const lastValue = S.fromMaybe ([]) (last);
  const appFOrUpdate = S.fromMaybe ([]) (S.dropLast (1) (acc));
  return S.append (S.append (value) (lastValue)) (appFOrUpdate);
};

const replace = a => b => s => s.replace (a, b);

const indexOf = elm => array => {
  const index = array.indexOf (elm);
  return index === -1 ? S.Nothing : S.Just (index);
};

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

const bundleDef = lines => defLines =>
  S.pipe ([
    S.unchecked.flip ({
      index: S.pipe ([
        Sl.nth (0),
        S.chain (S.flip (indexOf) (lines))
      ]),
      title: S.pipe ([
        Sl.nth (0),
        S.map (replace (/ *\/\/ */) (''))
      ]),
      meta: S.pipe ([
        S.map (replace (/ *\/\/ */) ('')),
        S.joinWith ('\n'),
        S.splitOn ('\n\n'),
        Sl.nth (1),
      ]),
      exemples: S.pipe ([
        S.map (replace (/ *\/\/ */) ('')),
        S.joinWith ('\n'),
        S.splitOn ('\n\n'),
        S.drop (2),
        S.map (S.joinWith ('\n\n')),
      ]),
    }),
    S.unchecked.sequence (S.Maybe),
  ]) (defLines);

const bundleDefs = lines =>
  S.pipe ([
    S.filter (S.test (/ *\/\//)),
    // debug ('file'),
    S.reduce (bob) ([]),
    S.map (bundleDef (lines)),
    S.justs,
  ]) (lines);

const toTextFormat = S.pipe ([
  S.map (defToString),
  S.joinWith ('\n\n')
]);

const apiString = S.pipe ([
  readFile,
  S.lines,
  bundleDefs,
  toTextFormat
]) (path.resolve (APP_DIR, 'index.mjs'));

const readmePath = path.resolve (APP_DIR, 'README.md');

S.pipe ([
  readFile,
  S.lines,
  lines => S.take (S.fromMaybe (0) (indexOf ('## API') (lines))) (lines),
  S.fromMaybe ([]),
  S.append ('## API'),
  S.append (''),
  S.append (apiString),
  S.append (''),
  S.unlines,
  writeFile (readmePath),
]) (readmePath);
