import {S, Sl} from './utils.mjs';
import {getApiDoc} from './common.mjs';
import {debug} from './debug.mjs';

const t1 =
  '> const f1 = maybeToFluture ("not a number") (S.Just (1))\n' +
  '> const f2 = maybeToFluture ("not a number") (S.Nothing)\n' +
  '\n' +
  "> fork (log ('rejection')) (log ('resolution')) (f1)\n" +
  '[resolution]: 1\n' +
  '\n' +
  "> fork (log ('rejection')) (log ('resolution')) (f2)\n" +
  '[rejection]: not a number';

const t2 =
  '> nth (0) ([])\n' +
  'Nothing\n' +
  '\n' +
  '> nth (1) ([1, 2, 3])\n' +
  'Just (2)\n' +
  '\n' +
  '> nth (7) ([1, 2, 3])\n' +
  'Nothing';

const isTestInstruction = S.pipe ([
  S.last,
  debug ('last'),
  S.map (S.test (/^[^>.].*$/)),
  debug ('test'),
  S.fromMaybe (false),
]);

const isFlutureTest = S.pipe ([
  S.dropLast (1), // drop the result
  S.fromMaybe ([]),
  S.joinWith (' '),
  Sl.replace (/ +/g) (' '),
  S.test (/> fork ?\(log ?\('rejection'\)\) ?\(log ?\('resolution'\)\)/),
]);

const buildFlutureTestInstruction = S.pipe ([
  
]);

const buildClassicTestInstruction = S.pipe ([
  
]);

const buildTestInstruction = S.ifElse (isFlutureTest)
                                      (buildFlutureTestInstruction)
                                      (buildClassicTestInstruction);

const buildPreTestInstruction = S.pipe ([
  S.map (Sl.replace (/. (.*)$/) ('$1')),
  Sl.replace (/\n\. +/g) (''),
  Sl.replace (/ +/g) (' '),
  Sl.replace (/> (.);?/g) ('$1;'),
]);

const buildInstruction = S.ifElse (isTestInstruction)
                                  (buildTestInstruction)
                                  (buildPreTestInstruction);

const buildTest = S.pipe ([
  S.splitOn ('\n\n'),
  S.map (S.splitOn ('\n')),
  S.map (buildInstruction),
  debug ('1'),
]);

const toto = S.pipe ([
  S.unchecked.flip ({
    title: S.pipe ([
      S.prop ('title'),
      Sl.firstGroupMatch (/^([a-zA-Z0-9]+) :: /)
    ]),
    tests: S.pipe ([
      S.prop ('exemples'),
      buildTest
    ]),
  }),
  S.sequence (S.Maybe),
]);

const testMap = S.pipe ([
  getApiDoc,
  S.rights,
  debug ('map'),
  S.map (toto),
  S.justs,
  debug ('test'),
]);

// testMap (path.resolve (APP_DIR, 'index.mjs'))

// buildTest (t1);
