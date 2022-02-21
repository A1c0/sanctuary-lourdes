import {parallel, reject, resolve} from 'fluture';
import {FutureType, env as flutureEnv} from 'fluture-sanctuary-types';
import sanctuary from 'sanctuary';
import $ from 'sanctuary-def';
import Identity from 'sanctuary-identity';

export const create = ({checkTypes}) => {
  const Sl = {};

  const S = sanctuary.create ({
    checkTypes: checkTypes,
    env: sanctuary.env.concat (flutureEnv),
  });

  const def = $.create ({
    checkTypes: checkTypes,
    env: sanctuary.env,
  });

  /**
   * Some custom type
   * @typedef {(number)} NonNegativeInteger
   * @typedef {(number)} PositiveInteger
   * @template A
   * @template B
   * @template C
   * @template S
   * @typedef {(A)} A
   * @typedef {(B)} B
   * @typedef {(C)} C
   * @typedef {(S)} S
   * @typedef {(*)} Lens
   * @typedef {(*)} Lens
   * @template T
   * @template U
   * @typedef {function (x :T): boolean} Predicate<T>
   * @typedef {function (x :T): U} Fn<T,U>
   */

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
  // > Sl.nth (0) ([])
  // Nothing
  //
  // > Sl.nth (1) ([1, 2, 3])
  // Just (2)
  //
  // > Sl.nth (7) ([1, 2, 3])
  // Nothing
  const _nth = index => array =>
    index < array.length ? S.Just (array[index]) : S.Nothing;

  /** @type{function(index: NonNegativeInteger): function(array: Array<A>): Maybe<A>} */
  Sl.nth = def ('nth')
               ({})
               ([$.NonNegativeInteger, $.Array (a), $.Maybe (a)])
               (_nth);

  // indexOf :: a -> Array a -> Maybe NonNegativeInteger
  //
  // Get the first index of an array which corresponding to an item
  //
  // > Sl.indexOf ('red') (['red', 'green', 'blue'])
  // Just (0)
  //
  // > Sl.indexOf ('yellow') (['red', 'green', 'blue'])
  // Nothing
  //
  // > Sl.indexOf ({name: "white", hex: "#fff"})
  // .            ([{name: "white", hex: "#fff"}, {name: "black", hex: "#000"}])
  // Just (0)
  const _indexOf = item => array =>
    Sl.toMaybe (x => x !== -1) (array.findIndex (x => S.equals (item) (x)));

  /** @type{function(item: A): function(array: Array<A>): Maybe<A>} */
  Sl.indexOf = def ('indexOf')
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
  // > Sl.splitEach (3) ([1, 2, 3, 4, 5, 6, 7, 8, 9])
  // [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
  //
  // > Sl.splitEach (2) ([1, 2, 3, 4, 5, 6, 7])
  // [[1, 2], [3, 4], [5, 6], [7]]
  const _splitEach = n => array =>
    S.pipe ([
      _sizeDivideBy (n),
      S.range (0),
      S.map (_sliceArray (array) (n))
    ]) (array);

  /** @type{function(n: PositiveInteger): function(array: Array<A>): Array<Array<A>>} */
  Sl.splitEach = def ('splitEach')
                     ({})
                     ([$.PositiveInteger, $.Array (a), $.Array ($.Array (a))])
                     (_splitEach);

  // intersperse :: a -> Array a -> Array a
  //
  // Separate each item by an item.
  //
  // > Sl.intersperse ("b") (["a", "c"])
  // ["a", "b", "c"]
  //
  // > Sl.intersperse ("b") (["a"])
  // ["a"]
  //
  // > Sl.intersperse ("b") ([])
  // []
  const _intersperse = item =>
    S.pipe ([
      S.lift2 (S.lift2 (S.reduce (acc => value => [...acc, item, value])))
              (S.take (1))
              (S.tail),
      S.fromMaybe ([]),
    ]);

  /** @type{function(item: A): function(array: Array<A>): Array<A>} */
  Sl.intersperse = def ('intersperse')
                       ({})
                       ([a, $.Array (a), $.Array (a)])
                       (_intersperse);

  // #####################
  // #####   REGEX   #####
  // #####################

  // extractString :: Regex -> String -> Maybe String
  //
  // Get the first group match in a string
  //
  // > const extractStringExample = Sl.extractString (/hello ([a-z]*)!/);
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
      S.chain (Sl.nth (0)),
      S.join,
    ]) (string);

  /** @type{function(regex: RegExp): function(str: string): Maybe<string>} */
  Sl.extractString = def ('extractString')
                         ({})
                         ([$.RegExp, $.String, $.Maybe ($.String)])
                         (_extractString);

  // replace :: Regex -> String -> String -> String
  //
  // Replace a substring with a RegExp
  //
  // > Sl.replace (/bob/) ('john') ('hello bob')
  // "hello john"
  //
  // > Sl.replace (/a/gi) ('o') ('Aaaaahhhh')
  // "ooooohhhh"
  const _replace = regExp => substr => str => str.replace (regExp, substr);
  /** @type{function(regex: RegExp): function(substr: string): function(str: string): string} */
  Sl.replace = def ('replace')
                   ({})
                   ([$.RegExp, $.String, $.String, $.String])
                   (_replace);

  // #####################
  // #####   LOGIC   #####
  // #####################

  // allPass :: Array (a -> Boolean) -> a -> Boolean
  //
  // Return `true` if all predicates return true, else return `false`
  //
  // > const isEvenNumber = x => x%2 === 0;
  // > const isPositiveNumber  = x => x > 0;
  // > const isPositiveEvenNumber = Sl.allPass ([isEvenNumber, isPositiveNumber]);
  //
  // > isPositiveEvenNumber (0)
  // false
  //
  // > isPositiveEvenNumber (1)
  // false
  //
  // > isPositiveEvenNumber (-2)
  // false
  //
  // > isPositiveEvenNumber (2)
  // true
  const _allPass = predicates => value => {
    for (const predicate of predicates) {
      if (!predicate (value)) {
        return false;
      }
    }
    return true;
  };
  const allPass = def ('allPass')
                      ({})
                      ([$.Array ($.Predicate (a)), a, $.Boolean])
                      (_allPass);
  /** @type{function(predicates: Array<Predicate<A>>): function(value: A): boolean} */
  Sl.allPass = predicates => value => allPass (predicates) (value);

  // anyPass :: Array (a -> Boolean) -> a -> Boolean
  //
  // Return `true` if one of predicates return true, else return `false`
  //
  // > const isSix = x => x === 6;
  // > const isNegative  = x => x < 0;
  // > const isNegativeOrSix = Sl.anyPass ([isNegative, isSix]);
  //
  // > isNegativeOrSix (0)
  // false
  //
  // > isNegativeOrSix (1)
  // false
  //
  // > isNegativeOrSix (-2)
  // true
  //
  // > isNegativeOrSix (6)
  // true
  const _anyPass = predicates => value => {
    for (const predicate of predicates) {
      if (predicate (value)) {
        return true;
      }
    }
    return false;
  };
  /** @type{function(predicates: Array<Predicate<A>>): function(value: A): boolean} */
  Sl.anyPass = def ('anyPass')
                   ({})
                   ([$.Array ($.Predicate (a)), a, $.Boolean])
                   (_anyPass);

  // cond :: Array Pair (a -> Boolean) (a -> b) -> a -> Either a b
  //
  // Apply transformer predicate return true anc return a Right value
  // If any predicate return `true`, it will return initial value in Left Value
  //
  // > const condExample = Sl.cond ([
  // .   S.Pair (S.test (/^[a-zA-Z]+$/)) (S.toUpper),
  // .   S.Pair (S.test (/[a-zA-Z]+/)) (S.toLower),
  // . ]);
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
  /** @type{function(regex: Array<Pair<Predicate<A>, Fn<A, B>>>): function(string: string): Maybe<string>} */
  Sl.cond = def ('cond')
                ({})
                ([$.Array ($.Pair ($.Predicate (a)) ($.Fn (a) (b))), a, $.Either (a) (b)])
                (_cond);

  // ####################
  // #####   LENS   #####
  // ####################
  //
  // Use [implementation created by David Chambers](https://gist.github.com/davidchambers/45aa0187a32fbac6912d4b3b4e8530c5)

  // lens :: (s -> a) -> (a -> s -> s) -> Lens s a
  /** @type{function(getter: Fn<S,A>): function(setter: Fn<A,Fn<S,S>>): Lens<S,A>} */
  Sl.lens = getter => setter => f => s =>
    S.map (v => setter (v) (s)) (f (getter (s)));
  // view :: Lens s a -> s -> a
  //
  // Allow to get a value by a Lens
  //
  // > const email = Sl.lens (user => user.email) (email => user => ({...user, email}));
  // > const user = {id: 1, email: 'dc@davidchambers.me'};
  //
  // > Sl.view (email) (user)
  // dc@davidchambers.me
  /** @type{function(lens: Lens<S,A>): function(value: S): A} */
  Sl.view = lens => value => lens (S.Left) (value).value;

  // over :: Lens s a -> (a -> a) -> s -> s
  //
  // Allow to set a value by a Lens
  //
  // > const email = Sl.lens (user => user.email) (email => user => ({...user, email}));
  // > const user = {id: 1, email: 'dc@davidchambers.me'};
  //
  // > Sl.over (email) (S.toUpper) (user)
  // {id: 1, email: 'DC@DAVIDCHAMBERS.ME'}
  /** @type{function(lens: Lens<S,A>): function(value: S): A} */
  Sl.over = lens => fn => value => S.extract (lens (y => Identity (fn (y)))
                                                   (value));

  // lensProp :: String -> Lens s a
  //
  // Create a Lens for an object property
  //
  // > const user = {id: 1, email: 'dc@davidchambers.me'};
  //
  // > Sl.view (Sl.lensProp('email')) (user)
  // 'dc@davidchambers.me'
  //
  // > Sl.over (Sl.lensProp('email')) (S.toUpper) (user)
  // {id: 1, email: 'DC@DAVIDCHAMBERS.ME'}
  /** @type{function(prop: string): Lens<S,A>} */
  Sl.lensProp = prop =>
    Sl.lens (S.prop (prop)) (p => obj => ({...obj, [prop]: p}));

  const _deepSingleton = paths => value =>
    S.pipe ([
      S.reverse,
      S.map (S.singleton),
      S.flip (S.pipe) (value)
    ]) (paths);

  const _props = paths => value =>
    S.pipe ([
      S.map (S.prop),
      S.flip (S.pipe) (value)
    ]) (paths);

  // lensProps :: Array String -> Lens s a
  //
  // Create a Lens for an object property path
  //
  // > const example = {a: {b: {c: 1}}};
  //
  // > Sl.view (Sl.lensProps (['a', 'b', 'c']))
  // .         (example)
  // 1
  //
  // > Sl.over (Sl.lensProps (['a', 'b', 'c']))
  // .         (S.add (1))
  // .         (example)
  // {a: {b: {c: 2}}}
  /** @type{function(props: Array<string>): Lens<S,A>} */
  Sl.lensProps = props =>
    Sl.lens (_props (props))
            (p => obj => ({...obj, ..._deepSingleton (props) (p)}));

  // #####################
  // #####   MAYBE   #####
  // #####################

  // toMaybe :: (a -> Boolean) -> a -> Maybe a
  //
  // Wrapping value in Maybe depending on predicate
  //
  // > Sl.toMaybe (x => !!x) (null)
  // Nothing
  //
  // > Sl.toMaybe (x => !!x) (undefined)
  // Nothing
  //
  // > Sl.toMaybe (x => !!x) (1)
  // Just (1)
  const _toMaybe = predicate => S.ifElse (predicate)
                                         (S.Just)
                                         (S.K (S.Nothing));
  /** @type{function(predicate: Predicate<A>): function(value: A): Maybe<A>} */
  Sl.toMaybe = def ('toMaybe')
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
  // > const toEven = Sl.toEither (x => x % 2 === 0)
  // .                            (x => `${x} is not a even number`);
  //
  // > toEven (1)
  // Left ("1 is not a even number")
  //
  // > toEven (2)
  // Right (2)
  const _toEither = predicate => leftConstructor => value =>
    predicate (value) ? S.Right (value) : S.Left (leftConstructor (value));
  /** @type{function(predicate: Predicate<A>): function(fn : {function(value: A): B}): function(value : A) :Either<B, A>} */
  Sl.toEither = def ('toEither')
                    ({})
                    ([$.Predicate (a), $.Fn (a) (b), a, $.Either (b) (a)])
                    (_toEither);

  // #######################
  // #####   FLUTURE   #####
  // #######################

  // flMap :: PositiveInteger -> (a -> Fluture b c) -> Array a -> Fluture b Array c
  //
  // Apply a function that return a Fluture on each item of an array and return a Fluture
  //
  // > const array = [1, 2, 3, 4, 5];
  // > const f1 = Sl.flMap (1) (x => resolve (1 + x)) (array);
  // > const f2 = Sl.flMap (1) (x => reject ("error: " + x)) (array);
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
  /** @type{function(parallelN: PositiveInteger): function(fn : {function(value: A): FutureType<B, C>}): function(value : Array<A>) : FutureType<B, Array<C>>} */
  Sl.flMap = def ('flMap')
                 ({})
                 ([$.PositiveInteger, $.Fn (a) (FutureType (b) (c)), $.Array (a), FutureType (b) ($.Array (c))])
                 (_flMap);

  // toFluture :: (a -> Boolean) -> (a -> b) -> a -> Fluture b a
  //
  // Convert to a Fluture depending on predicate
  //
  // > const toOdd = Sl.toFluture (x => x % 2 !== 0)
  // .                            (x => `${x} is not a odd number`);
  //
  // > fork (log ('rejection')) (log ('resolution')) (toOdd (2))
  // [rejection]: "2 is not a odd number"
  //
  // > fork (log ('rejection')) (log ('resolution')) (toOdd (1))
  // [resolution]: 1
  const _toFluture = predicate => leftConstructor => value =>
    predicate (value) ? resolve (value) : reject (leftConstructor (value));
  /** @type{function(predicate: Predicate<A>): function(fn : {function(value: A): B}): function(value : A) : FutureType<B, A>} */
  Sl.toFluture = def ('toFluture')
                     ({})
                     ([$.Predicate (a), $.Fn (a) (b), a, FutureType (b) (a)])
                     (_toFluture);

  // maybeToFluture :: b -> Maybe a -> Fluture b a
  //
  // Convert a Maybe to a Fluture
  //
  // > const f1 = Sl.maybeToFluture ("not a number") (S.Just (1));
  // > const f2 = Sl.maybeToFluture ("not a number") (S.Nothing);
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
  /** @type{function(leftValue: B): function(value: Maybe<A>): FutureType<B, A>} */
  Sl.maybeToFluture = def ('maybeToFluture')
                          ({})
                          ([b, $.Maybe (a), FutureType (b) (a)])
                          (_maybeToFluture);

  // eitherToFluture :: Either a b -> Fluture a b
  //
  // Convert an Either to a Fluture
  //
  // > const f1 = Sl.eitherToFluture (S.Right (1));
  // > const f2 = Sl.eitherToFluture (S.Left ("error"));
  //
  // > fork (log ('rejection')) (log ('resolution')) (f1)
  // [resolution]: 1
  //
  // > fork (log ('rejection')) (log ('resolution')) (f2)
  // [rejection]: "error"
  /** @type{function(either: Either<B, A>) : FutureType<B, A>} */
  const eitherToFluture = def ('eitherToFluture')
                              ({})
                              ([$.Either (b) (a), FutureType (b) (a)])
                              (S.either (reject) (resolve));
  Sl.eitherToFluture = either => eitherToFluture (either);

  return Sl;
};

const Sl = create ({checkTypes: true});
export default Sl;
