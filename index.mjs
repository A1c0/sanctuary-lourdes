import {parallel, reject, resolve} from 'fluture';
import {FutureType, env as flutureEnv} from 'fluture-sanctuary-types';
import sanctuary from 'sanctuary';
import $ from 'sanctuary-def';
import Identity from 'sanctuary-identity';

export const create = ({checkTypes}) => {
  const exportFn = {};

  const S = sanctuary.create ({
    checkTypes: checkTypes,
    env: sanctuary.env.concat (flutureEnv),
  });

  const def = $.create ({
    checkTypes: checkTypes,
    env: sanctuary.env,
  });

  const a = $.TypeVariable ('a');
  const b = $.TypeVariable ('b');
  const c = $.TypeVariable ('c');

  // #####################
  // #####   ARRAY   #####
  // #####################

  // nth :: NonNegativeInteger -> Array a -> Maybe a
  //
  // Get the N th elements of array
  //
  // > nth (0) ([])
  // Nothing
  //
  // > nth (1) ([1, 2, 3])
  // Just (2)
  //
  // > nth (7) ([1, 2, 3])
  // Nothing
  const _nth = index => array =>
    index < array.length ? S.Just (array[index]) : S.Nothing;
  const nth = def ('nth')
                  ({})
                  ([$.NonNegativeInteger, $.Array (a), $.Maybe (a)])
                  (_nth);
  exportFn.nth = index => array => nth (index) (array);

  // indexOf :: a -> Array a -> Maybe NonNegativeInteger
  //
  // Get the first index of an array which corresponding to an item
  //
  // > indexOf ('red') (['red', 'green', 'blue'])
  // Just (0)
  //
  // > indexOf ('yellow') (['red', 'green', 'blue'])
  // Nothing
  const _indexOf = elm => array => {
    const index = array.indexOf (elm);
    return index === -1 ? S.Nothing : S.Just (index);
  };
  const indexOf = def ('indexOf')
                      ({})
                      ([a, $.Array (a), $.Maybe ($.NonNegativeInteger)])
                      (_indexOf);
  exportFn.indexOf = elm => array => indexOf (elm) (array);

  // _sliceArray :: Array a -> PositiveInteger -> PositiveInteger -> Array a
  const _sliceArray = array => n => index =>
    array.slice (index * n, (index + 1) * n);

  // _sizeDivideBy :: PositiveInteger -> Array a -> PositiveInteger
  const _sizeDivideBy = n => array =>
    S.pipe ([
      S.size,
      S.div (n),
      Math.round
    ]) (array);

  // splitEach :: PositiveInteger -> Array a -> Array Array a
  //
  // Split an array on sub-array of size N
  //
  // > splitEach (3) ([1, 2, 3, 4, 5, 6, 7, 8, 9])
  // [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
  //
  // > splitEach (2) ([1, 2, 3, 4, 5, 6, 7])
  // [[1, 2], [3, 4], [5, 6], [7]]
  const _splitEach = n => array =>
    S.pipe ([
      _sizeDivideBy (n),
      S.range (0),
      S.map (_sliceArray (array) (n))
    ]) (array);
  const splitEach = def ('splitEach')
                        ({})
                        ([$.PositiveInteger, $.Array (a), $.Array ($.Array (a))])
                        (_splitEach);
  exportFn.splitEach = n => array => splitEach (n) (array);

  // #####################
  // #####   REGEX   #####
  // #####################

  // extractString :: Regex -> String -> Maybe String
  //
  // Get the first group match in a string
  //
  // > const extractStringExample = extractString (/hello ([a-z]*)!/);
  //
  // > extractStringExample ('hello john!')
  // Just ("john")
  //
  // > extractStringExample ('hello bob!')
  // Just ("bob")
  //
  // > extractStringExample ('hello 123!')
  // Nothing
  //
  // > extractStringExample ('hi john!')
  // Nothing
  const _extractString = regex => string =>
    S.pipe ([
      S.match (regex),
      S.map (S.prop ('groups')),
      S.chain (nth (0)),
      S.join
    ]) (string);
  exportFn.extractString = def ('extractString')
                               ({})
                               ([$.RegExp, $.String, $.Maybe ($.String)])
                               (_extractString);

  // replace :: Regex -> String -> String -> String
  //
  // Replace a substring with a RegExp
  //
  // > replace (/bob/) ('john') ('hello bob')
  // "hello john"
  //
  // > replace (/a/gi) ('o') ('Aaaaahhhh')
  // "ooooohhhh"
  const _replace = regExp => strReplace => str =>
    str.replace (regExp, strReplace);
  const replace = def ('replace')
                      ({})
                      ([$.RegExp, $.String, $.String, $.String])
                      (_replace);
  exportFn.replace = regExp => strReplace => str =>
    replace (regExp) (strReplace) (str);

  // #####################
  // #####   LOGIC   #####
  // #####################

  // cond :: Array Pair (a -> Boolean) (a -> b) -> a -> Either a b
  //
  // Apply transformer predicate return true anc return a Right value
  // If any predicate return `true`, it will return initial value in Left Value
  //
  // > const condExample = cond ([
  // .   S.Pair (S.test (/^[a-zA-Z]+$/)) (S.toUpper),
  // .   S.Pair (S.test (/[a-zA-Z]+/)) (S.toLower),
  // . ])
  //
  // > condExample ('hello')
  // Right ("HELLO")
  //
  // > condExample ('HELLO!')
  // Right ("hello!")
  //
  // > condExample ('123!')
  // Left ("123!")
  const _cond = conditionPairs => value => {
    for (const pair of conditionPairs) {
      const predicate = S.fst (pair);
      if (predicate (value)) {
        const transform = S.snd (pair);
        return S.Right (transform (value));
      }
    }
    return S.Left (value);
  };
  const cond = def ('cond')
                   ({})
                   ([$.Array ($.Pair ($.Predicate (a)) ($.Fn (a) (b))), a, $.Either (a) (b)])
                   (_cond);
  exportFn.cond = conditionPairs => value => cond (conditionPairs) (value);

  // ####################
  // #####   LENS   #####
  // ####################
  //
  // Use [implementation created by David Chambers](https://gist.github.com/davidchambers/45aa0187a32fbac6912d4b3b4e8530c5)

  // lens :: (s -> a) -> (a -> s -> s) -> Lens s a
  const lens = getter => setter => f => s =>
    S.map (v => setter (v) (s)) (f (getter (s)));
  exportFn.lens = lens;
  // view :: Lens s a -> s -> a
  //
  // Allow to get a value by a Lens
  //
  // > const email = lens (user => user.email) (email => user => ({...user, email}));
  // > const user = {id: 1, email: 'dc@davidchambers.me'};
  //
  // > view (email) (user)
  // dc@davidchambers.me
  const view = lens => value => lens (S.Left) (value).value;
  exportFn.view = view;

  // over :: Lens s a -> (a -> a) -> s -> s
  //
  // Allow to set a value by a Lens
  //
  // > const email = lens (user => user.email) (email => user => ({...user, email}));
  // > const user = {id: 1, email: 'dc@davidchambers.me'};
  //
  // > over (email) (S.toUpper) (user)
  // {id: 1, email: 'DC@DAVIDCHAMBERS.ME'}
  const over = lens => fn => value =>
    S.extract (lens (y => Identity (fn (y))) (value));
  exportFn.over = over;

  // #####################
  // #####   MAYBE   #####
  // #####################

  // toMaybe :: (a -> Boolean) -> a -> Maybe a
  //
  // Wrapping value in Maybe depending on predicate
  //
  // > toMaybe (x => !!x) (null)
  // Nothing
  //
  // > toMaybe (x => !!x) (undefined)
  // Nothing
  //
  // > toMaybe (x => !!x) (1)
  // Just (1)
  const _toMaybe = predicate => S.ifElse (predicate)
                                         (S.Just)
                                         (S.K (S.Nothing));
  const toMaybe = def ('toMaybe')
                      ({})
                      ([$.Predicate (a), a, $.Maybe (a)])
                      (_toMaybe);
  exportFn.toMaybe = predicate => value => toMaybe (predicate) (value);

  // ######################
  // #####   EITHER   #####
  // ######################

  // toEither :: (a -> Boolean) -> (a -> b) -> a -> Either b a
  //
  // Convert to Either depending on predicate
  //
  // > const toEven = toEither (x => x % 2 === 0)
  // .                         (x => `${x} is not a even number`)
  //
  // > toEven (1)
  // Left ("1 is not a even number")
  //
  // > toEven (2)
  // Right (2)
  const _toEither = predicate => leftConstructor => value =>
    predicate (value) ? S.Right (value) : S.Left (leftConstructor (value));
  const toEither = def ('toEither')
                       ({})
                       ([$.Predicate (a), $.Fn (a) (b), a, $.Either (b) (a)])
                       (_toEither);
  exportFn.toEither = predicate => leftConstructor => value =>
    toEither (predicate) (leftConstructor) (value);

  // #######################
  // #####   FLUTURE   #####
  // #######################

  // flMap :: PositiveNumber -> (a -> Fluture b c) -> Array a -> Fluture b Array c
  //
  // Apply a function that return a Fluture on each item of an array and return a Fluture
  //
  // > const array = [1, 2, 3, 4, 5]
  // > const f1 = flMap (1) (x => resolve (1 + x)) (array);
  // > const f2 = flMap (1) (x => reject ("error: " + x)) (array);
  //
  // > fork (log ('rejection')) (log ('resolution')) (f1)
  // [resolution]: [2, 3, 4, 5, 6]
  //
  // > fork (log ('rejection')) (log ('resolution')) (f2)
  // [rejection]: "error: 1"
  const _flMap = parallelN => fn => array =>
    S.pipe ([
      S.map (fn),
      parallel (parallelN)
    ]) (array);
  const flMap = def ('flMap')
                    ({})
                    ([$.PositiveNumber, $.Fn (a) (FutureType (b) (c)), $.Array (a), FutureType (b) ($.Array (c))])
                    (_flMap);
  exportFn.flMap = parallelN => fn => array => flMap (parallelN) (fn) (array);

  // toFluture :: (a -> Boolean) -> (a -> b) -> a -> Fluture b a
  //
  // Convert to a Fluture depending on predicate
  //
  // > const toOdd = toFluture (x => x % 2 !== 0)
  // .                         (x => `${x} is not a odd number`)
  //
  // > fork (log ('rejection')) (log ('resolution')) (toOdd (2))
  // [rejection]: "2 is not a odd number"
  //
  // > fork (log ('rejection')) (log ('resolution')) (toOdd (1))
  // [resolution]: 1
  const _toFluture = predicate => leftConstructor => value =>
    predicate (value) ? resolve (value) : reject (leftConstructor (value));
  const toFluture = def ('toFluture')
                        ({})
                        ([$.Predicate (a), $.Fn (a) (b), a, FutureType (b) (a)])
                        (_toFluture);
  exportFn.toFluture = predicate => leftConstructor => value =>
    toFluture (predicate) (leftConstructor) (value);

  // maybeToFluture :: b -> Maybe a -> Fluture b a
  //
  // Convert a Maybe to a Fluture
  //
  // > const f1 = maybeToFluture ("not a number") (S.Just (1))
  // > const f2 = maybeToFluture ("not a number") (S.Nothing)
  //
  // > fork (log ('rejection')) (log ('resolution')) (f1)
  // [resolution]: 1
  //
  // > fork (log ('rejection')) (log ('resolution')) (f2)
  // [rejection]: "not a number"
  const _maybeToFluture = left => value =>
    S.pipe ([
      S.maybeToEither (left),
      eitherToFluture
    ]) (value);
  const maybeToFluture = def ('maybeToFluture')
                             ({})
                             ([b, $.Maybe (a), FutureType (b) (a)])
                             (_maybeToFluture);
  exportFn.maybeToFluture = left => value => maybeToFluture (left) (value);

  // eitherToFluture :: Either a b -> Fluture a b
  //
  // Convert an Either to a Fluture
  //
  // > const f1 = eitherToFluture (S.Right (1))
  // > const f2 = eitherToFluture (S.Left ("error"))
  //
  // > fork (log ('rejection')) (log ('resolution')) (f1)
  // [resolution]: 1
  //
  // > fork (log ('rejection')) (log ('resolution')) (f2)
  // [rejection]: "error"
  const eitherToFluture = def ('eitherToFluture')
                              ({})
                              ([$.Either (b) (a), FutureType (b) (a)])
                              (S.either (reject) (resolve));
  exportFn.eitherToFluture = either => eitherToFluture (either);
  return exportFn;
};
