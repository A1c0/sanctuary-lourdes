import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

import {env as flutureEnv} from 'fluture-sanctuary-types';
import sanctuary from 'sanctuary';

import {create} from '../index.mjs';

export const S = sanctuary.create ({
  checkTypes: true,
  env: sanctuary.env.concat (flutureEnv),
});

export const Sl = create ({
  checkTypes: true,
});

const __dirname = path.dirname (fileURLToPath (import.meta.url));
export const APP_DIR = path.dirname (__dirname);

export const readFile = x => fs.readFileSync (x, 'utf8');

const appendOnDef = acc => value => {
  const last = S.last (acc);
  if (S.isNothing (last)) {
    return S.append ([value]) (acc);
  }
  if (S.test (/::/) (value)) {
    return S.append ([value]) (acc);
  }
  const lastValue = S.fromMaybe ([]) (last);
  const appFOrUpdate = S.fromMaybe ([]) (S.dropLast (1) (acc));
  return S.append (S.append (value) (lastValue)) (appFOrUpdate);
};

export const createGroupOnDef = S.reduce (appendOnDef) ([]);

export const writeFile = S.curry2 (fs.writeFileSync);

export const replace = a => b => s => s.replace (a, b);
