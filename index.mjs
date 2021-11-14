import {parallel, reject, resolve} from 'fluture';
import {FutureType, env as flutureEnv} from 'fluture-sanctuary-types';
import sanctuary from 'sanctuary';
import $ from 'sanctuary-def';
import Identity from 'sanctuary-identity';

export const create = ({checkTypes}) => {
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

  // #####################
  // #####   REGEX   #####
  // #####################

  // firstGroupMatch :: Regex -> String -> Maybe String
  //
  // Get the first match in a string
  //
  // > const firstGroupMatchExample = firstGroupMatch (/hello ([a-z]*)!/);
  //
  // > firstGroupMatchExample ('hello john!')
  // Just ("john")
  //
  // > firstGroupMatchExample ('hello bob!')
  // Just ("bob")
  //
  // > firstGroupMatchExample ('hello 123!')
  // Nothing
  //
  // > firstGroupMatchExample ('hi john!')
  // Nothing
  const _firstGroupMatch = regex => string =>
    S.pipe ([
      S.match (regex),
      S.map (S.prop ('groups')),
      S.chain (nth (0)),
      S.join
    ]) (string);
  const firstGroupMatch = def ('firstGroupMatch')
                              ({})
                              ([$.RegExp, $.String, $.Maybe ($.String)])
                              (_firstGroupMatch);

  // replace :: Regex -> String -> String -> String
  //
  // Replace a substring with a RegExp
  //
  // > replace (/bob/) ('john') ('hello bob')
  // "hello john"
  const _replace = regExp => strReplace => str =>
    str.replace (regExp, strReplace);
  const replace = def ('replace')
                      ({})
                      ([$.RegExp, $.String, $.String, $.String])
                      (_replace);

  // #####################
  // #####   LOGIC   #####
  // #####################

  // cond :: Array Pair (a -> Boolean) (a -> b) -> a -> Either a b
  //
  // Apply transformer when predicate return true anc return a Right value
  // If any predicate return `true`, it will return initial value in Left Value
  //
  // > const condExemple = cond ([
  // .   S.Pair (S.test (/^[a-zA-Z]+$/)) (S.toUpper),
  // .   S.Pair (S.test (/[a-zA-Z]+/)) (S.toLower),
  // . ])
  //
  // > condExemple ('hello')
  // Right ("HELLO")
  //
  // > condExemple ('HELLO!')
  // Right ("hello!")
  //
  // > condExemple ('123!')
  // Left ("123!")
  const _cond = pairs => value => {
    for (const pair of pairs) {
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

  // ####################
  // #####   LENS   #####
  // ####################
  //
  // Use [implementation created by David Chambers](https://gist.github.com/davidchambers/45aa0187a32fbac6912d4b3b4e8530c5)
  // and add some too.

  // lens :: (s -> a) -> (a -> s -> s) -> Lens s a
  const lens = getter => setter => f => s =>
    S.map (v => setter (v) (s)) (f (getter (s)));

  // view :: Lens s a -> s -> a
  const view = l => x => l (S.Left) (x).value;

  // over :: Lens s a -> (a -> a) -> s -> s
  const over = l => f => x => S.extract (l (y => Identity (f (y))) (x));

  const lensProp = 1;
  const lensPath = 2;
  const lensIndex = 3;

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
  const _toEither = predicate => leftC => x =>
    predicate (x) ? S.Right (x) : S.Left (leftC (x));
  const toEither = def ('toEither')
                       ({})
                       ([$.Predicate (a), $.Fn (a) (b), a, $.Either (b) (a)])
                       (_toEither);

  // #######################
  // #####   FLUTURE   #####
  // #######################

  // flMap :: PositiveNumber -> (a -> Fluture b c) -> Array a -> Fluture b Array c
  const flMap = n => fn => array => S.pipe ([
    S.map (fn),
    parallel (n)
  ]) (array);

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
  const _toFluture = predicate => leftC => x =>
    predicate (x) ? resolve (x) : reject (leftC (x));
  const toFluture = def ('toFluture')
                        ({})
                        ([$.Predicate (a), $.Fn (a) (b), a, FutureType (b) (a)])
                        (_toFluture);

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
  const _maybeToFluture = left => x =>
    S.pipe ([
      S.maybeToEither (left),
      eitherToFluture
    ]) (x);
  const maybeToFluture = def ('maybeToFluture')
                             ({})
                             ([b, $.Maybe (a), FutureType (b) (a)])
                             (_maybeToFluture);

  // eitherToFluture :: Either a b -> Fluture a b
  //
  // Convert a Either to a Fluture
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

  return {
    toMaybe,
    indexOf,
    nth,
    flMap,
    splitEach,
    toFluture,
    toEither,
    eitherToFluture,
    maybeToFluture,
    firstGroupMatch,
    replace,
    cond,
    lens,
    view,
    over,
  };
};
