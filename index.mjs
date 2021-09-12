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

  // toMaybe :: (a -> Boolean) -> a -> Maybe a
  //
  // Wrapping value in Maybe depending on predicate
  //
  // > toMaybe (x => !!x) (null)
  // S.Nothing
  //
  // > toMaybe (x => !!x) (undefined)
  // S.Nothing
  //
  // > toMaybe (x => !!x) (1)
  // S.Just (1)
  const _toMaybe = predicate => S.ifElse (predicate)
                                         (S.Just)
                                         (S.K (S.Nothing));
  const toMaybe = def ('toMaybe')
                      ({})
                      ([$.Predicate (a), a, $.Maybe (a)])
                      (_toMaybe);

  // nth :: NonNegativeInteger -> Array a -> Maybe a
  //
  // Get the N th elements of array
  //
  // > nth (0) ([])
  // S.Nothing
  //
  // > nth (1) ([1, 2, 3])
  // S.Just (2)
  //
  // > nth (7) ([1, 2, 3])
  // S.Nothing
  const _nth = index => array =>
    index < array.length ? S.Just (array[index]) : S.Nothing;
  const nth = def ('nth')
                  ({})
                  ([$.NonNegativeInteger, $.Array (a), $.Maybe (a)])
                  (_nth);

  // flMap :: PositiveNumber -> (a -> Fluture b c) -> Array a -> Fluture b Array c
  const flMap = n => fn => array => S.pipe ([
    S.map (fn),
    parallel (n)
  ]) (array);

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

  // toFluture :: (a -> Boolean) -> (a -> b) -> a -> Fluture b a
  const _toFluture = predicate => leftC => x =>
    predicate (x) ? resolve (x) : reject (leftC (x));
  const toFluture = def ('toFluture')
                        ({})
                        ([$.Predicate (a), $.Fn (a) (b), a, FutureType (b) (a)])
                        (_toFluture);

  // toEither :: (a -> Boolean) -> (a -> b) -> a -> Either b a
  const _toEither = predicate => leftC => x =>
    predicate (x) ? S.Right (x) : S.Left (leftC (x));
  const toEither = def ('toEither')
                       ({})
                       ([$.Predicate (a), $.Fn (a) (b), a, $.Either (b) (a)])
                       (_toEither);

  // eitherToFluture :: Either a b -> Fluture a b
  const eitherToFluture = def ('eitherToFluture')
                              ({})
                              ([$.Either (b) (a), FutureType (b) (a)])
                              (S.either (reject) (resolve));

  // maybeToFluture :: b -> Maybe a -> Fluture b a
  const _maybeToFluture = left => x =>
    S.pipe ([
      S.maybeToEither (left),
      eitherToFluture
    ]) (x);
  const maybeToFluture = def ('maybeToFluture')
                             ({})
                             ([b, $.Maybe (a), FutureType (b) (a)])
                             (_maybeToFluture);

  // firstGroupMatch :: Regex -> String -> Maybe String
  //
  // Get the first match in a string
  //
  // > firstGroupMatch (/hello ([a-z]*)/) ('hello john!')
  // S.Just('john')
  //
  // > firstGroupMatch (/hello ([a-z]*)/) ('hello bob!')
  // S.Just('bob')
  //
  // > firstGroupMatch (/hello ([a-z]*)/) ('hi john!')
  // S.Nothing
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

  // cond :: Array Pair (a -> Boolean) (a -> b) -> a -> Either a b
  //
  // Apply transformer when predicate return true anc return a Right value
  // If any predicate return `true`, it will return initial value in Left Value
  //
  // > cond ([
  // .   S.Pair (S.test (/^[a-zA-Z]+$/)) (S.toUpper),
  // .   S.Pair (S.test (/[a-zA-Z]+/)) (S.toLower),
  // . ]) ('hello')
  // S.Right ('HELLO')
  //
  // > cond ([
  // .   S.Pair (S.test (/^[a-zA-Z]+$/)) (S.toUpper),
  // .   S.Pair (S.test (/[a-zA-Z]+/)) (S.toLower),
  // . ]) ('HELLO!')
  // S.Right ('hello!')
  //
  // > cond ([
  // .   S.Pair (S.test (/^[a-zA-Z]+$/)) (S.toUpper),
  // .   S.Pair (S.test (/[a-zA-Z]+/)) (S.toLower),
  // . ]) ('123!')
  // S.Left ('123!')
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

  // lens :: (s -> a) -> (a -> s -> s) -> Lens s a
  const lens = getter => setter => f => s =>
    S.map (v => setter (v) (s)) (f (getter (s)));

  // view :: Lens s a -> s -> a
  const view = l => x => l (S.Left) (x).value;

  // over :: Lens s a -> (a -> a) -> s -> s
  const over = l => f => x => S.extract (l (y => Identity (f (y))) (x));

  return {
    toMaybe,
    nth,
    flMap,
    splitEach,
    toFluture,
    toEither,
    eitherToFluture,
    maybeToFluture,
    firstGroupMatch,
    cond,
    lens,
    view,
    over,
  };
};
