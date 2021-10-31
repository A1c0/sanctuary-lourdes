import path from 'path';
import {APP_DIR, S} from './utils.mjs';
import {getApiDoc} from './common.mjs';
import {debug} from './debug.mjs';

const testMap = S.pipe ([
  getApiDoc,
  S.rights,
  debug ('map')
]) (path.resolve (APP_DIR, 'index.mjs'));
