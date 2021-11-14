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

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L25">`nth :: NonNegativeInteger -> Array a -> Maybe a`</a>

Get the N th elements of array

```js

```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L44">`indexOf :: a -> Array a -> Maybe NonNegativeInteger`</a>

Get the first index of an array which corresponding to an item

```js

```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L74">`splitEach :: PositiveInteger -> Array a -> Array Array a`</a>

Split an array on sub-array of size N

```js

```

### Regex

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L98">`firstGroupMatch :: Regex -> String -> Maybe String`</a>

Get the first match in a string

```js

```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L127">`replace :: Regex -> String -> String -> String`</a>

Replace a substring with a RegExp

```js

```

### Logic

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L144">`cond :: Array Pair (a -> Boolean) (a -> b) -> a -> Either a b`</a>

Apply transformer when predicate return true anc return a Right value
If any predicate return `true`, it will return initial value in Left Value

```js

```

### Lens

### Maybe

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L195">`toMaybe :: (a -> Boolean) -> a -> Maybe a`</a>

Wrapping value in Maybe depending on predicate

```js

```

### Either

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L219">`toEither :: (a -> Boolean) -> (a -> b) -> a -> Either b a`</a>

Convert to Either depending on predicate

```js

```

### Fluture

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L248">`toFluture :: (a -> Boolean) -> (a -> b) -> a -> Fluture b a`</a>

Convert to a Fluture depending on predicate

```js

```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L267">`maybeToFluture :: b -> Maybe a -> Fluture b a`</a>

Convert a Maybe to a Fluture

```js

```

#### <a href="https://github.com/A1c0/sanctuary-lourdes/blob/main/index.mjs#L289">`eitherToFluture :: Either a b -> Fluture a b`</a>

Convert a Either to a Fluture

```js

```
