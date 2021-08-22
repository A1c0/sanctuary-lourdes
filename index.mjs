import {parallel, reject, resolve} from 'fluture';
import {FutureType} from 'fluture-sanctuary-types';

const create = ({$, S, def}) => {
  const a = $.TypeVariable ('a');
  const b = $.TypeVariable ('b');

  // toMaybe :: (a -> Boolean) -> a -> Maybe a
  //
  // Wrapping value in Maybe depending on predicate
  //
  // > toMaybe(x => !!x)(null)
  // S.Nothing
  // > toMaybe(x => !!x)(undefined)
  // S.Nothing
  // > toMaybe(x => !!x)(1)
  // S.Just(1)
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
  // > nth(0)([])
  // S.Nothing
  // > nth(1)([1, 2, 3])
  // S.Just(2)
  // > nth(7)([1, 2, 3])
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

  // cond :: Array Pair (a -> Boolean) (a -> b) -> a ->  Either a b
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
  };
};
