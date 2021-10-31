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

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L25">`nth :: NonNegativeInteger -> Array a -> Maybe a`</a>

Get the N th elements of array

```js
> nth (0) ([])
Nothing

> nth (1) ([1, 2, 3])
Just (2)

> nth (7) ([1, 2, 3])
Nothing
```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L44">`indexOf :: a -> Array a -> Maybe PositiveNumber`</a>

Get the first index of an array which corresponding to an item

```js
> indexOf ('red') (['red', 'green', 'blue'])
Just (0)

> indexOf ('yellow') (['red', 'green', 'blue'])
Nothing
```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L74">`splitEach :: PositiveInteger -> Array a -> Array Array a`</a>

Split an array on sub-array of size N

```js
> splitEach (3) ([1, 2, 3, 4, 5, 6, 7, 8, 9])
[[1, 2, 3], [4, 5, 6], [7, 8, 9]]

> splitEach (2) ([1, 2, 3, 4, 5, 6, 7])
[[1, 2], [3, 4], [5, 6], [7]]
#####################
#####   REGEX   #####
#####################
```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L98">`firstGroupMatch :: Regex -> String -> Maybe String`</a>

Get the first match in a string

```js
> const firstGroupMatchExample = firstGroupMatch ('hello john!')

> firstGroupMatchExample ('hello john!')
Just ('john')

> firstGroupMatchExample ('hello bob!')
Just ('bob')

> firstGroupMatchExample ('hi john!')
Nothing
#####################
#####   LOGIC   #####
#####################
```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L128">`cond :: Array Pair (a -> Boolean) (a -> b) -> a -> Either a b`</a>

Apply transformer when predicate return true anc return a Right value
If any predicate return `true`, it will return initial value in Left Value

```js
> const condExemple = cond ([
.   S.Pair (S.test (/^[a-zA-Z]+$/)) (S.toUpper),
.   S.Pair (S.test (/[a-zA-Z]+/)) (S.toLower),
. ]) ('hello')

> condExemple ('HELLO!')
Right ('hello!')

> condExemple ('123!')
Left ('123!')
#####################
#####   LENS   #####
#####################
```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L176">`toMaybe :: (a -> Boolean) -> a -> Maybe a`</a>

Wrapping value in Maybe depending on predicate

```js
> toMaybe (x => !!x) (null)
Nothing

> toMaybe (x => !!x) (undefined)
Nothing

> toMaybe (x => !!x) (1)
Just (1)
######################
#####   EITHER   #####
######################
```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L200">`toEither :: (a -> Boolean) -> (a -> b) -> a -> Either b a`</a>

Convert to Either depending on predicate

```js
> const toEven = toEither (x => x % 2 === 0)
.                         (x => `${x} is not a even number)

> toEven (1)
Left ('1 is not a even number')

> toEven (2)
Right (2)
#######################
#####   FLUTURE   #####
#######################
```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L229">`toFluture :: (a -> Boolean) -> (a -> b) -> a -> Fluture b a`</a>

Convert to a Fluture depending on predicate

```js
> const toOdd = toFluture (x => x % 2 !== 0)
.                         (x => `${x} is not a even number)

> fork (log ('rejection')) (log ('resolution')) (toOdd (1))
[rejection]: 1 is not a even number

> fork (log ('rejection')) (log ('resolution')) (toOdd (1))
[resolution]: 1 is not a even number
```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L248">`maybeToFluture :: b -> Maybe a -> Fluture b a`</a>

Convert a Maybe to a Fluture

```js
> const f1 = maybeToFluture ("not a number") (S.Just (1))
> const f2 = maybeToFluture ("not a number") (S.Nothing)

> fork (log ('rejection')) (log ('resolution')) (f1)
[resolution]: 1

> fork (log ('rejection')) (log ('resolution')) (f2)
[rejection]: not a number
```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L270">`eitherToFluture :: Either a b -> Fluture a b`</a>

Convert a Either to a Fluture

```js
> const f1 = eitherToFluture (S.Right (1))
> const f2 = eitherToFluture (S.Left ("error"))

> fork (log ('rejection')) (log ('resolution')) (f1)
[resolution]: 1

> fork (log ('rejection')) (log ('resolution')) (f2)
[rejection]: error
```

