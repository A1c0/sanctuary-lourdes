import {createGroupOnDef, readFile, replace, S, Sl} from './utils.mjs';

const bundleDef = lines => defLines =>
  S.pipe ([
    S.unchecked.flip ({
      index: S.pipe ([
        Sl.nth (0),
        S.chain (S.flip (Sl.indexOf) (lines))
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
    createGroupOnDef,
    S.map (bundleDef (lines)),
    S.justs,
  ]) (lines);

export const getApiDoc = S.pipe ([
  readFile,
  S.lines,
  bundleDefs
]);
