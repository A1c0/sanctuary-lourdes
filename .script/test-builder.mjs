import * as path from 'path';

import {getApiDoc} from './common.mjs';
import {debug} from './debug.mjs';
import {APP_DIR, S, Sl} from './utils.mjs';

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

const t3 =
  '> const condExemple = cond ([\n' +
  '.   S.Pair (S.test (/^[a-zA-Z]+$/)) (S.toUpper),\n' +
  '.   S.Pair (S.test (/[a-zA-Z]+/)) (S.toLower),\n' +
  '. ])\n' +
  '\n' +
  "> condExemple ('hello')\n" +
  'Right ("HELLO")\n' +
  '\n' +
  "> condExemple ('HELLO!')\n" +
  'Right ("hello!")\n' +
  '\n' +
  "> condExemple ('123!')\n" +
  'Left ("123!")';

const t4 =
  '> const firstGroupMatchExample = firstGroupMatch (/hello ([a-z]*)!/);\n' +
  '\n' +
  "> firstGroupMatchExample ('hello john!')\n" +
  'Just ("john")\n' +
  '\n' +
  "> firstGroupMatchExample ('hello bob!')\n" +
  'Just ("bob")\n' +
  '\n' +
  "> firstGroupMatchExample ('hello 123!')\n" +
  'Nothing\n' +
  '\n' +
  "> firstGroupMatchExample ('hi john!')\n" +
  'Nothing';

const t5 =
  '> const condExemple = cond ([\n' +
  '.   S.Pair (S.test (/^[a-zA-Z]+$/)) (S.toUpper),\n' +
  '.   S.Pair (S.test (/[a-zA-Z]+/)) (S.toLower),\n' +
  '. ])\n' +
  '\n' +
  "> condExemple ('hello')\n" +
  'Right ("HELLO")\n' +
  '\n' +
  "> condExemple ('HELLO!')\n" +
  'Right ("hello!")\n' +
  '\n' +
  "> condExemple ('123!')\n" +
  'Left ("123!")';

//    isFlutureTest :: Array String -> Boolean
const isFlutureTest = S.pipe ([
  S.dropLast (1), // drop the result
  S.fromMaybe ([]),
  S.joinWith (' '),
  Sl.replace (/ +/g) (' '),
  S.test (/> fork ?\(log ?\('rejection'\)\) ?\(log ?\('resolution'\)\)/),
]);

//    joinInstruction :: Array String -> String
const joinInstruction = S.pipe ([
  S.joinWith ('\n'),
  Sl.replace (/\n\. +/g) (''),
  Sl.replace (/ +/g) (' '),
]);

//    buildFlutureTestInstruction :: Array String -> String
const extractFluture = Sl.firstGroupMatch (/^fork *\(log *\('rejection'\)\) *\(log *\('resolution'\)\) *\((.*?)\)/);

const buildFlutureTestInstruction = S.pipe ([
  debug ('buildFlutureTestInstruction_1'),
  S.flip ({
    current: S.pipe ([
      S.dropLast (1),
      S.fromMaybe ([]),
      debug ('A'),
      joinInstruction,
      debug ('B'),
      Sl.replace (/> (.*?)/) ('$1'),
      debug ('C'),
      extractFluture,
      debug ('D'),
    ]),
    expected: S.last,
  }),
  debug ('debug'),
  S.sequence (S.Maybe),
  S.map (({current, expected}) =>
    `t.deepEqual (showIfSanctuaryValue (await forkLog (${current})), parseExpected ('${expected}'));`),
  S.fromMaybe ("throw new Error('Could not build test');"),
  debug ('buildFlutureTestInstruction_1'),
]);

//t.deepEqual (showIfSanctuaryValue (await forkLog (reject (1))),
//     parseExpected ('[rejection]: 1'));

//    buildClassicTestInstruction :: Array String -> {current: String, expected: String}
const buildClassicTestInstruction = S.pipe ([
  S.flip ({
    current: S.pipe ([
      S.dropLast (1),
      S.fromMaybe ([]),
      joinInstruction,
      Sl.replace (/> (.*?)/) ('$1'),
    ]),
    expected: S.pipe ([
      S.last,
      S.fromMaybe ('')
    ]),
  }),
  ({current, expected}) =>
    `t.deepEqual (showIfSanctuaryValue (${current}), parseExpected ('${expected}'));`,
]);

//    buildTestInstruction :: Array String -> String
const buildTestInstruction = S.ifElse (isFlutureTest)
                                      (buildFlutureTestInstruction)
                                      (buildClassicTestInstruction);

//    appendOnLastItem :: Array Array a -> a -> Array Array a
const appendOnLastItem = array => value =>
  S.pipe ([
    S.last,
    S.fromMaybe ([]),
    S.append (value),
    S.flip (S.append) (S.fromMaybe ([]) (S.dropLast (1) (array))),
  ]) (array);

const appendIfNotNewInstruction = acc =>
  S.ifElse (S.test (/^> .*$/))
           (v => S.append ([v]) (acc))
           (appendOnLastItem (acc));

//    splitOnInstruction :: Array String -> Array Array String
const splitOnInstruction = S.reduce (appendIfNotNewInstruction) ([]);

//    buildPreTestInstruction :: Array String -> String
const buildPreTestInstruction = S.pipe ([
  debug ('ab'),
  splitOnInstruction,
  debug ('a'),
  S.map (S.pipe ([
    S.map (Sl.replace (/\. (.*)$/) ('$1')),
    debug ('b'),
    joinInstruction,
    debug ('c'),
    Sl.replace (/\n+/) ('\n'),
    debug ('d'),
    Sl.replace (/> (.*(\n.*)*[^;]);?/g) ('$1;'),
    debug ('e'),
  ])),
  debug ('f'),
  S.joinWith ('\n'),
  debug ('g'),
  debug ('buildPreTestInstruction'),
]);

//    isTestInstruction :: Array String -> Boolean
const isTestInstruction = S.pipe ([
  S.last,
  S.map (S.test (/^[^>.].*$/)),
  S.fromMaybe (false),
]);

//    buildInstruction :: Array String -> String
const buildInstruction = S.ifElse (isTestInstruction)
                                  (buildTestInstruction)
                                  (buildPreTestInstruction);

//    buildTest :: String -> Array String
const buildTest = S.pipe ([
  S.splitOn ('\n\n'),
  S.map (S.splitOn ('\n')),
  S.map (buildInstruction),
  debug ('buildTest'),
]);

const toto = S.pipe ([
  S.unchecked.flip ({
    title: S.pipe ([
      S.prop ('title'),
      Sl.firstGroupMatch (/^([a-zA-Z0-9]+) :: /),
      S.fromMaybe ('Unknown'),
    ]),
    tests: S.pipe ([
      S.prop ('examples'),
      debug ('tests'),
      buildTest
    ]),
  }),
]);

const testMap = S.pipe ([
  getApiDoc,
  debug ('getApiDoc'),
  S.rights,
  S.map (toto),
  debug ('map (toto)'),
]);

testMap (path.resolve (APP_DIR, 'index.mjs'));
