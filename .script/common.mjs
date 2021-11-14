import {S, Sl, readFile, replace} from './utils.mjs';

const appendOnDef = acc => value => {
  const last = S.last (acc);
  if (S.isNothing (last)) {
    return S.append ([value]) (acc);
  }
  if (S.test (/::/) (value)) {
    return S.append ([value]) (acc);
  }
  if (S.test (S.regex ('') ('#'.repeat (6))) (value)) {
    const lastLine = S.fromMaybe ('') (S.chain (S.last) (last));
    if (S.complement (S.test (/##/)) (lastLine)) {
      return S.append ([value]) (acc);
    }
  }
  const lastValue = S.fromMaybe ([]) (last);
  const appFOrUpdate = S.fromMaybe ([]) (S.dropLast (1) (acc));
  return S.append (S.append (value) (lastValue)) (appFOrUpdate);
};

export const createGroupOnDef = S.reduce (appendOnDef) ([]);

const bundleDef = lines => defLines =>
  S.pipe ([
    S.unchecked.flip ({
      index: S.pipe ([
        Sl.nth (0),
        S.chain (S.flip (Sl.indexOf) (lines))
      ]),
      title: S.pipe ([
        Sl.nth (0),
        S.map (replace (/ *\/\/ */) ('')),
        S.chain (Sl.toMaybe (S.test (/[A-Za-z0-9]+ :: [A-Za-z0-9() ]+ (-> [A-Za-z0-9() ]+)*/))),
      ]),
      meta: S.pipe ([
        S.map (replace (/ *\/\/ */) ('')),
        S.joinWith ('\n'),
        S.splitOn ('\n\n'),
        Sl.nth (1),
      ]),
      examples: S.pipe ([
        S.map (replace (/ *\/\/ */) ('')),
        S.joinWith ('\n'),
        S.splitOn ('\n\n'),
        S.drop (2),
        S.map (S.joinWith ('\n\n')),
      ]),
    }),
    S.unchecked.sequence (S.Maybe),
    S.maybeToEither (defLines),
  ]) (defLines);

const bundleDefs = lines =>
  S.pipe ([
    S.filter (S.test (/ *\/\//)),
    createGroupOnDef,
    S.map (bundleDef (lines)),
  ]) (lines);

export const getApiDoc = S.pipe ([
  readFile,
  S.lines,
  bundleDefs
]);
