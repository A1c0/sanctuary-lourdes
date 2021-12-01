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

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L28">`nth :: NonNegativeInteger -> Array a -> Maybe a`</a>

Get the N th elements of array

```js
> nth (0) ([])
Nothing

> nth (1) ([1, 2, 3])
Just (2)

> nth (7) ([1, 2, 3])
Nothing
```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L47">`indexOf :: a -> Array a -> Maybe NonNegativeInteger`</a>

Get the first index of an array which corresponding to an item

```js
> indexOf ('red') (['red', 'green', 'blue'])
Just (0)

> indexOf ('yellow') (['red', 'green', 'blue'])
Nothing
```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L77">`splitEach :: PositiveInteger -> Array a -> Array Array a`</a>

Split an array on sub-array of size N

```js
> splitEach (3) ([1, 2, 3, 4, 5, 6, 7, 8, 9])
[[1, 2, 3], [4, 5, 6], [7, 8, 9]]

> splitEach (2) ([1, 2, 3, 4, 5, 6, 7])
[[1, 2], [3, 4], [5, 6], [7]]
```

### Regex

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L101">`extractString :: Regex -> String -> Maybe String`</a>

Get the first group match in a string

```js
> const extractStringExample = extractString (/hello ([a-z]*)!/);

> extractStringExample ('hello john!')
Just ("john")

> extractStringExample ('hello bob!')
Just ("bob")

> extractStringExample ('hello 123!')
Nothing

> extractStringExample ('hi john!')
Nothing
```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L130">`replace :: Regex -> String -> String -> String`</a>

Replace a substring with a RegExp

```js
> replace (/bob/) ('john') ('hello bob')
"hello john"

> replace (/a/gi) ('o') ('Aaaaahhhh')
"ooooohhhh"
```

### Logic

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L150">`cond :: Array Pair (a -> Boolean) (a -> b) -> a -> Either a b`</a>

Apply transformer predicate return true anc return a Right value
If any predicate return `true`, it will return initial value in Left Value

```js
> const condExemple = cond ([
.   S.Pair (S.test (/^[a-zA-Z]+$/)) (S.toUpper),
.   S.Pair (S.test (/[a-zA-Z]+/)) (S.toLower),
. ])

> condExemple ('hello')
Right ("HELLO")

> condExemple ('HELLO!')
Right ("hello!")

> condExemple ('123!')
Left ("123!")
```

### Lens

Use [implementation created by David Chambers](https://gist.github.com/davidchambers/45aa0187a32fbac6912d4b3b4e8530c5)

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L193">`view :: Lens s a -> s -> a`</a>

Allow to get a value by a Lens

```js
> const email = lens (user => user.email) (email => user => ({...user, email}));
> const user = {id: 1, email: 'dc@davidchambers.me'};

> view (email) (user)
dc@davidchambers.me
```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L204">`over :: Lens s a -> (a -> a) -> s -> s`</a>

Allow to set a value by a Lens

```js
> const email = lens (user => user.email) (email => user => ({...user, email}));
> const user = {id: 1, email: 'dc@davidchambers.me'};

> over (email) (S.toUpper) (user)
{id: 1, email: 'DC@DAVIDCHAMBERS.ME'}
```

### Maybe

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L219">`toMaybe :: (a -> Boolean) -> a -> Maybe a`</a>

Wrapping value in Maybe depending on predicate

```js
> toMaybe (x => !!x) (null)
Nothing

> toMaybe (x => !!x) (undefined)
Nothing

> toMaybe (x => !!x) (1)
Just (1)
```

### Either

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L243">`toEither :: (a -> Boolean) -> (a -> b) -> a -> Either b a`</a>

Convert to Either depending on predicate

```js
> const toEven = toEither (x => x % 2 === 0)
.                         (x => `${x} is not a even number`)

> toEven (1)
Left ("1 is not a even number")

> toEven (2)
Right (2)
```

### Fluture

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L266">`flMap :: PositiveNumber -> (a -> Fluture b c) -> Array a -> Fluture b Array c`</a>

Apply a function that return a Fluture on each item of an array and return a Fluture

```js
> const array = [1, 2, 3, 4, 5]
> const f1 = flMap (1) (x => resolve (1 + x)) (array);
> const f2 = flMap (1) (x => reject ("error: " + x)) (array);

> fork (log ('rejection')) (log ('resolution')) (f1)
[resolution]: [2, 3, 4, 5, 6]

> fork (log ('rejection')) (log ('resolution')) (f2)
[rejection]: "error: 1"
```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L288">`toFluture :: (a -> Boolean) -> (a -> b) -> a -> Fluture b a`</a>

Convert to a Fluture depending on predicate

```js
> const toOdd = toFluture (x => x % 2 !== 0)
.                         (x => `${x} is not a odd number`)

> fork (log ('rejection')) (log ('resolution')) (toOdd (2))
[rejection]: "2 is not a odd number"

> fork (log ('rejection')) (log ('resolution')) (toOdd (1))
[resolution]: 1
```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L307">`maybeToFluture :: b -> Maybe a -> Fluture b a`</a>

Convert a Maybe to a Fluture

```js
> const f1 = maybeToFluture ("not a number") (S.Just (1))
> const f2 = maybeToFluture ("not a number") (S.Nothing)

> fork (log ('rejection')) (log ('resolution')) (f1)
[resolution]: 1

> fork (log ('rejection')) (log ('resolution')) (f2)
[rejection]: "not a number"
```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L329">`eitherToFluture :: Either a b -> Fluture a b`</a>

Convert a Either to a Fluture

```js
> const f1 = eitherToFluture (S.Right (1))
> const f2 = eitherToFluture (S.Left ("error"))

> fork (log ('rejection')) (log ('resolution')) (f1)
[resolution]: 1

> fork (log ('rejection')) (log ('resolution')) (f2)
[rejection]: "error"
```
