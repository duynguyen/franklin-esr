import esbuild from 'esbuild'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'

esbuild
  .build({
    plugins: [NodeModulesPolyfillPlugin()],
    platform: 'browser',
    conditions: ['node'],
    entryPoints: ['./worker/index.js'],
    sourcemap: true,
    bundle: true,
    minify: false,
    outfile: './dist/client/_worker.js',
    logLevel: 'warning',
    format: 'esm',
    target: 'es2020',
    external: [
      '__STATIC_CONTENT_MANIFEST'
    ]
  })
  .then(() => console.log('Worker built successfully'))
  .catch((error) => console.error('Worker build failed', error))
