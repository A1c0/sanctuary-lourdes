import * as path from 'path';

import {debug} from './debug.mjs';
import {APP_DIR, S, Sl, readFile} from './utils.mjs';

S.pipe ([
  readFile,
  Sl.replace (/export const create = \({checkTypes}\) => {/)
             ('const checkTypes = true;'),
  S.lines,
  lines => S.take (S.fromMaybe (0) (Sl.indexOf ('  return {') (lines)))
                  (lines),
  S.fromMaybe ([]),
  S.reject (S.test (/^ *\/\/.*$/)),
  S.map (Sl.replace (/^ {2}(.*)$/) ('$1')),
  S.joinWith ('\n'),
  Sl.replace (/\n{3,}/g) ('\n\n'),
  debug ('1'),
]) (path.resolve (APP_DIR, 'index.mjs'));
