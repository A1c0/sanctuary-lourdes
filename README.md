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

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L21">`toMaybe :: (a -> Boolean) -> a -> Maybe a`</a>

Wrapping value in Maybe depending on predicate

```js
> toMaybe (x => !!x) (null)
S.Nothing

> toMaybe (x => !!x) (undefined)
S.Nothing

> toMaybe (x => !!x) (1)
S.Just (1)
```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L41">`nth :: NonNegativeInteger -> Array a -> Maybe a`</a>

Get the N th elements of array

```js
> nth (0) ([])
S.Nothing

> nth (1) ([1, 2, 3])
S.Just (2)

> nth (7) ([1, 2, 3])
S.Nothing
```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L78">`splitEach :: PositiveInteger -> Array a -> Array Array a`</a>

Split an array on sub-array of size N

```js
> splitEach (3) ([1, 2, 3, 4, 5, 6, 7, 8, 9])
[[1, 2, 3], [4, 5, 6], [7, 8, 9]]

> splitEach (2) ([1, 2, 3, 4, 5, 6, 7])
[[1, 2], [3, 4], [5, 6], [7]]
```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L131">`firstGroupMatch :: Regex -> String -> Maybe String`</a>

Get the first match in a string

```js
> firstGroupMatch (/hello ([a-z]*)/) ('hello john!')
S.Just('john')

> firstGroupMatch (/hello ([a-z]*)/) ('hello bob!')
S.Just('bob')

> firstGroupMatch (/hello ([a-z]*)/) ('hi john!')
S.Nothing
```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L155">`cond :: Array Pair (a -> Boolean) (a -> b) -> a -> Either a b`</a>

Apply transformer predicate return true anc return a Right value
If any predicate return `true`, it will return initial value in Left Value

```js
> cond ([
.   S.Pair (S.test (/^[a-zA-Z]+$/)) (S.toUpper),
.   S.Pair (S.test (/[a-zA-Z]+/)) (S.toLower),
. ]) ('hello')
S.Right ('HELLO')

> cond ([
.   S.Pair (S.test (/^[a-zA-Z]+$/)) (S.toUpper),
.   S.Pair (S.test (/[a-zA-Z]+/)) (S.toLower),
. ]) ('HELLO!')
S.Right ('hello!')

> cond ([
.   S.Pair (S.test (/^[a-zA-Z]+$/)) (S.toUpper),
.   S.Pair (S.test (/[a-zA-Z]+/)) (S.toLower),
. ]) ('123!')
S.Left ('123!')
```

