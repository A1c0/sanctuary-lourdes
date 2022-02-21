const pkg = require('./package.json');

export default {
  input: 'index.js',
  external: Object.keys(pkg.dependencies),
  output: {
    format: 'umd',
    file: 'index.cjs',
    name: 'Sl',
  }
};
