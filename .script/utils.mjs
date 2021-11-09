import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

import {env as flutureEnv} from 'fluture-sanctuary-types';
import sanctuary from 'sanctuary';

import {create} from '../index.mjs';

const CHECK_TYPES_SANCTUARY = process.env.CHECK_TYPES_SANCTUARY === 'true';

const _S = sanctuary.create ({
  checkTypes: CHECK_TYPES_SANCTUARY,
  env: sanctuary.env.concat (flutureEnv),
});

export const S = Object.assign (_S);

export const Sl = create ({
  checkTypes: CHECK_TYPES_SANCTUARY,
});

const __dirname = path.dirname (fileURLToPath (import.meta.url));
export const APP_DIR = path.dirname (__dirname);

export const readFile = x => fs.readFileSync (x, 'utf8');

export const writeFile = S.curry2 (fs.writeFileSync);

export const replace = a => b => s => s.replace (a, b);
