import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import typescript2 from 'rollup-plugin-typescript2'

const generalConfig = moduleSystem => ({
  input: 'src/index.ts',
  output: {
    dir: `dist/${moduleSystem}`,
    format: `${moduleSystem}`,
    sourcemap: true,
  },
  external: ['universal-fire', 'firemodel', 'firebase', 'aws-ssm', 'aws-log', 'common-types', 'stream', 'aws-sdk'],
  plugins: [
    commonjs(),
    resolve(),
    json(),
    typescript2({
      rootDir: '.',
      tsconfig: `tsconfig.es.json`,
      declaration: moduleSystem === 'es' ? true : false,
    }),
  ],
})

export default [generalConfig('cjs'), generalConfig('es')]
