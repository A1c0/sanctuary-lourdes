const dependencies = {
  'sanctuary-show': 'sanctuaryShow',
  'sanctuary-type-identifiers': 'sanctuaryTypeIdentifiers'
};

const pkg = require('./package.json');

console.log(pkg.dependencies);

export default {
  input: 'index.js',
  external: Object.keys(pkg.dependencies),
  output: {
    format: 'umd',
    file: 'index.cjs',
    name: 'Sl',
  }
};
