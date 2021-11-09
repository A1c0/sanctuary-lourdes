import {APP_DIR, readFile, S, Sl} from './utils.mjs';
import * as path from 'path';

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
]) (path.resolve (APP_DIR, 'index.mjs'));
