import path from 'path';

import {debug} from './debug.mjs';
import {APP_DIR, createGroupOnDef, readFile, S} from './utils.mjs';

const testMap = S.pipe ([
  readFile,
  S.lines,
  debug ('lines'),
  S.filter (S.test (/ *\/\//)),
  createGroupOnDef,
  debug ('groups'),
]) (path.resolve (APP_DIR, 'index.mjs'));
