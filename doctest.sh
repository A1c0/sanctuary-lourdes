cp index.mjs index.test.mjs
echo 'create ({checkTypes: true});' >> index.test.mjs
doctest --module esm index.test.mjs || (rm index.test.mjs && exit 1)
rm index.test.mjs
