# Sanctuary Lourdes

An utils library created by and for [Sanctuary](https://sanctuary.js.org/) 

## Get started

### Installation 

```shell
npm i sanctuary-lourdes
# OR
yarn add sanctuary-lourdes
```

### Usage
create instance of Sanctuary Lourdes near your instance of Sanctuary

````js
import sanctuary from 'sanctuary';
import {create} from 'sanctuary-lourdes';

const CHECK_TYPES_SANCTUARY = process.env.CHECK_TYPES_SANCTUARY === 'true';

const S = sanctuary.create ({
  checkTypes: CHECK_TYPES_SANCTUARY,
  env: sanctuary.env
});

const Sl = create({checkTypes: CHECK_TYPES_SANCTUARY});
````

## API

- [Array](#Array)
- [Regex](#Regex)
- [Logic](#Logic)
- [Lens](#Lens)
- [Maybe](#Maybe)
- [Either](#Either)
- [Fluture](#Fluture)


### Array

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.js#L48">`nth :: NonNegativeInteger -> Array a -> Maybe a`</a>

Get the N th elements of array

```js
> Sl.nth (0) ([])
Nothing

> Sl.nth (1) ([1, 2, 3])
Just (2)

> Sl.nth (7) ([1, 2, 3])
Nothing
```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.js#L69">`indexOf :: a -> Array a -> Maybe NonNegativeInteger`</a>

Get the first index of an array which corresponding to an item

```js
> Sl.indexOf ('red') (['red', 'green', 'blue'])
Just (0)

> Sl.indexOf ('yellow') (['red', 'green', 'blue'])
Nothing

> Sl.indexOf ({name: "white", hex: "#fff"})
.            ([{name: "white", hex: "#fff"}, {name: "black", hex: "#000"}])
Just (0)
```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.js#L103">`splitEach :: PositiveInteger -> Array a -> Array Array a`</a>

Split an array on sub-array of size N

```js
> Sl.splitEach (3) ([1, 2, 3, 4, 5, 6, 7, 8, 9])
[[1, 2, 3], [4, 5, 6], [7, 8, 9]]

> Sl.splitEach (2) ([1, 2, 3, 4, 5, 6, 7])
[[1, 2], [3, 4], [5, 6], [7]]
```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.js#L125">`intersperse :: a -> Array a -> Array a`</a>

Separate each item by an item.

```js
> Sl.intersperse ("b") (["a", "c"])
["a", "b", "c"]

> Sl.intersperse ("b") (["a"])
["a"]

> Sl.intersperse ("b") ([])
[]
```

### Regex

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.js#L155">`extractString :: Regex -> String -> Maybe String`</a>

Get the first group match in a string

```js
> const extractStringExample = Sl.extractString (/hello ([a-z]*)!/);

> extractStringExample ('hello john!')
Just ("john")

> extractStringExample ('hello bob!')
Just ("bob")

> extractStringExample ('hello 123!')
Nothing

> extractStringExample ('hi john!')
Nothing
```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.js#L186">`replace :: Regex -> String -> String -> String`</a>

Replace a substring with a RegExp

```js
> Sl.replace (/bob/) ('john') ('hello bob')
"hello john"

> Sl.replace (/a/gi) ('o') ('Aaaaahhhh')
"ooooohhhh"
```

### Logic

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.js#L206">`allPass :: Array (a -> Boolean) -> a -> Boolean`</a>

Return `true` if all predicates return true, else return `false`

```js
> const isEvenNumber = x => x%2 === 0;
> const isPositiveNumber  = x => x > 0;
> const isPositiveEvenNumber = Sl.allPass ([isEvenNumber, isPositiveNumber]);

> isPositiveEvenNumber (0)
false

> isPositiveEvenNumber (1)
false

> isPositiveEvenNumber (-2)
false

> isPositiveEvenNumber (2)
true
```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.js#L240">`anyPass :: Array (a -> Boolean) -> a -> Boolean`</a>

Return `true` if one of predicates return true, else return `false`

```js
> const isSix = x => x === 6;
> const isNegative  = x => x < 0;
> const isNegativeOrSix = Sl.anyPass ([isNegative, isSix]);

> isNegativeOrSix (0)
false

> isNegativeOrSix (1)
false

> isNegativeOrSix (-2)
true

> isNegativeOrSix (6)
true
```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.js#L273">`cond :: Array Pair (a -> Boolean) (a -> b) -> a -> Either a b`</a>

Apply transformer predicate return true anc return a Right value
If any predicate return `true`, it will return initial value in Left Value

```js
> const condExample = Sl.cond ([
.   S.Pair (S.test (/^[a-zA-Z]+$/)) (S.toUpper),
.   S.Pair (S.test (/[a-zA-Z]+/)) (S.toLower),
. ]);

> condExample ('hello')
Right ("HELLO")

> condExample ('HELLO!')
Right ("hello!")

> condExample ('123!')
Left ("123!")
```

### Lens

Use [implementation created by David Chambers](https://gist.github.com/davidchambers/45aa0187a32fbac6912d4b3b4e8530c5)

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.js#L317">`view :: Lens s a -> s -> a`</a>

Allow to get a value by a Lens

```js
> const email = Sl.lens (user => user.email) (email => user => ({...user, email}));
> const user = {id: 1, email: 'dc@davidchambers.me'};

> Sl.view (email) (user)
dc@davidchambers.me
```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.js#L329">`over :: Lens s a -> (a -> a) -> s -> s`</a>

Allow to set a value by a Lens

```js
> const email = Sl.lens (user => user.email) (email => user => ({...user, email}));
> const user = {id: 1, email: 'dc@davidchambers.me'};

> Sl.over (email) (S.toUpper) (user)
{id: 1, email: 'DC@DAVIDCHAMBERS.ME'}
```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.js#L342">`lensProp :: String -> Lens s a`</a>

Create a Lens for an object property

```js
> const user = {id: 1, email: 'dc@davidchambers.me'};

> Sl.view (Sl.lensProp('email')) (user)
'dc@davidchambers.me'

> Sl.over (Sl.lensProp('email')) (S.toUpper) (user)
{id: 1, email: 'DC@DAVIDCHAMBERS.ME'}
```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.js#L370">`lensProps :: Array String -> Lens s a`</a>

Create a Lens for an object property path

```js
> const example = {a: {b: {c: 1}}};

> Sl.view (Sl.lensProps (['a', 'b', 'c']))
.         (example)
1

> Sl.over (Sl.lensProps (['a', 'b', 'c']))
.         (S.add (1))
.         (example)
{a: {b: {c: 2}}}
```

### Maybe

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.js#L393">`toMaybe :: (a -> Boolean) -> a -> Maybe a`</a>

Wrapping value in Maybe depending on predicate

```js
> Sl.toMaybe (x => !!x) (null)
Nothing

> Sl.toMaybe (x => !!x) (undefined)
Nothing

> Sl.toMaybe (x => !!x) (1)
Just (1)
```

### Either

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.js#L418">`toEither :: (a -> Boolean) -> (a -> b) -> a -> Either b a`</a>

Convert to Either depending on predicate

```js
> const toEven = Sl.toEither (x => x % 2 === 0)
.                            (x => `${x} is not a even number`);

> toEven (1)
Left ("1 is not a even number")

> toEven (2)
Right (2)
```

### Fluture

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.js#L442">`flMap :: PositiveInteger -> (a -> Fluture b c) -> Array a -> Fluture b Array c`</a>

Apply a function that return a Fluture on each item of an array and return a Fluture

```js
> const array = [1, 2, 3, 4, 5];
> const f1 = Sl.flMap (1) (x => resolve (1 + x)) (array);
> const f2 = Sl.flMap (1) (x => reject ("error: " + x)) (array);

> fork (log ('rejection')) (log ('resolution')) (f1)
[resolution]: [2, 3, 4, 5, 6]

> fork (log ('rejection')) (log ('resolution')) (f2)
[rejection]: "error: 1"
```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.js#L466">`toFluture :: (a -> Boolean) -> (a -> b) -> a -> Fluture b a`</a>

Convert to a Fluture depending on predicate

```js
> const toOdd = Sl.toFluture (x => x % 2 !== 0)
.                            (x => `${x} is not a odd number`);

> fork (log ('rejection')) (log ('resolution')) (toOdd (2))
[rejection]: "2 is not a odd number"

> fork (log ('rejection')) (log ('resolution')) (toOdd (1))
[resolution]: 1
```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.js#L486">`maybeToFluture :: b -> Maybe a -> Fluture b a`</a>

Convert a Maybe to a Fluture

```js
> const f1 = Sl.maybeToFluture ("not a number") (S.Just (1));
> const f2 = Sl.maybeToFluture ("not a number") (S.Nothing);

> fork (log ('rejection')) (log ('resolution')) (f1)
[resolution]: 1

> fork (log ('rejection')) (log ('resolution')) (f2)
[rejection]: "not a number"
```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.js#L509">`eitherToFluture :: Either a b -> Fluture a b`</a>

Convert an Either to a Fluture

```js
> const f1 = Sl.eitherToFluture (S.Right (1));
> const f2 = Sl.eitherToFluture (S.Left ("error"));

> fork (log ('rejection')) (log ('resolution')) (f1)
[resolution]: 1

> fork (log ('rejection')) (log ('resolution')) (f2)
[rejection]: "error"
```
