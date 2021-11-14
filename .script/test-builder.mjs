import * as path from 'path';

import {getApiDoc} from './common.mjs';
import {APP_DIR, S, Sl, readFile, writeFile} from './utils.mjs';

const lib = S.pipe ([
  readFile,
  Sl.replace (/export const create = \({checkTypes}\) => {/)
             ('const checkTypes = true;'),
  S.lines,
  lines =>
    S.take (S.fromMaybe (0) (Sl.indexOf ('  return exportFn;') (lines)))
           (lines),
  S.fromMaybe ([]),
  S.reject (S.test (/^ *\/\/.*$/)),
  S.map (Sl.replace (/^ {2}(.*)$/) ('$1')),
  S.map (Sl.replace (/^exportFn\./) ('const ')),
  S.map (Sl.replace (/exportFn\./) ('')),
  S.joinWith ('\n'),
  Sl.replace (/\n{3,}/g) ('\n\n'),
]) (path.resolve (APP_DIR, 'index.mjs'));

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
const extractFluture = Sl.firstGroupMatch (/^fork *\(log *\('rejection'\)\) *\(log *\('resolution'\)\) *\((.*)\)/);

const buildFlutureTestInstruction = S.pipe ([
  S.flip ({
    current: S.pipe ([
      S.dropLast (1),
      S.fromMaybe ([]),
      joinInstruction,
      Sl.replace (/> (.*?)/) ('$1'),
      extractFluture,
    ]),
    expected: S.last,
  }),
  S.sequence (S.Maybe),
  S.map (({current, expected}) =>
    `t.deepEqual (showIfSanctuaryValue (await forkLog (${current})), parseExpected ('${expected}'));`),
  S.fromMaybe ("throw new Error('Could not build test');"),
]);

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
  splitOnInstruction,
  S.map (S.pipe ([
    S.map (Sl.replace (/\. (.*)$/) ('$1')),
    joinInstruction,
    Sl.replace (/\n+/) ('\n'),
    Sl.replace (/> (.*(\n.*)*[^;]);?/g) ('$1;'),
  ])),
  S.joinWith ('\n'),
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
      buildTest
    ]),
  }),
  ({title, tests}) =>
    [
      `test ('${title}', async t => {`,
      S.map (Sl.replace (/^(.*)$/) ('  $1'))
            (tests.join ('\n').split ('\n')),
      '});',
    ].flat (Infinity),
  S.joinWith ('\n'),
]);

const tests = S.pipe ([
  getApiDoc,
  S.rights,
  S.map (toto),
  S.joinWith ('\n\n')
]) (path.resolve (APP_DIR, 'index.mjs'));

const testScript = S.joinWith ('\n') ([
  readFile (path.resolve (APP_DIR, '.script/assets/prefix_import.txt')),
  lib,
  readFile (path.resolve (APP_DIR, '.script/assets/prefix.txt')),
  tests,
]);

writeFile (path.resolve (APP_DIR, 'sanctuary-lourde.test.mjs')) (testScript);
