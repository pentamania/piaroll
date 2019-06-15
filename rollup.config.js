import typescript from 'rollup-plugin-typescript';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import { uglify } from 'rollup-plugin-uglify';
import { libName, namespace } from './package.json';

/* plugin options */
const plugins = [
  commonjs(),
  nodeResolve(),
  typescript({
    lib: ["es5", "es6", "dom"],
    target: "es5"
  })
];
const plugins_min = plugins.concat([
  uglify(),
]);

export default [
  // iife ver.
  {
    // input: './src/entry.ts',
    input: './src/index.ts',
    output: {
      name: namespace,
      file: `dist/${libName}.js`,
      sourcemap: true,
      format: 'iife',
    },
    plugins: plugins,
  },

  // // iife-min ver.
  // {
  //   input: './src/entry.ts',
  //   output: {
  //     name: namespace,
  //     file: `dist/${libName}.min.js`,
  //     format: 'iife',
  //     sourcemap: true,
  //   },
  //   plugins: plugins_min,
  // },

  // // esm ver.
  // {
  //   input: './src/entry.ts',
  //   output: {
  //     // file: 'dist/pgul.esm.js',
  //     file: `dist/${libName}.esm.js`,
  //     format: 'esm'
  //   },
  //   plugins: plugins,
  // },
];