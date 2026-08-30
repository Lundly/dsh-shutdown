import { isBuiltin } from 'node:module'
import { defineConfig } from 'tsdown'

/**
 * Consumer-side build for Git installs (the `prepare` script): transpile
 * straight from `src` with the self-contained tsconfig.prepare.json, which
 * carries no project references to the sibling deepseek-harness checkout.
 * Types are NOT checked here. The browser half keeps the baseline externals so
 * it stays a module-table consumer; those imports are not resolved at build.
 */
const CLIENT_EXTERNALS = new Set([
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-store',
  '@deepseek-ai/dsh-client-ui-primitives',
  '@deepseek-ai/dsh-client-ui-slots',
])

const isClientExternal = (specifier: string): boolean => CLIENT_EXTERNALS.has(specifier)

export default defineConfig([
  {
    name: 'dsh-shutdown',
    entry: ['src/index.ts'],
    outDir: 'lib',
    format: ['esm'],
    platform: 'node',
    target: 'es2024',
    fixedExtension: false,
    dts: false,
    clean: false,
    tsconfig: 'tsconfig.prepare.json',
    deps: {
      neverBundle: (specifier: string) => specifier.startsWith('@deepseek-ai/') || isBuiltin(specifier),
      alwaysBundle: (specifier: string) => !specifier.startsWith('@deepseek-ai/') && !isBuiltin(specifier),
    },
  },
  {
    name: 'dsh-shutdown/client',
    entry: { client: 'src/client/index.ts' },
    outDir: 'lib',
    format: ['cjs'],
    platform: 'browser',
    target: 'es2024',
    fixedExtension: false,
    dts: false,
    sourcemap: true,
    clean: false,
    tsconfig: 'tsconfig.prepare.json',
    deps: {
      neverBundle: isClientExternal,
      alwaysBundle: (specifier: string) => !isClientExternal(specifier),
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
      'import.meta.env.MODE': JSON.stringify('production'),
      'import.meta.env': JSON.stringify({ MODE: 'production' }),
    },
    outputOptions: {
      entryFileNames: 'client.js',
      sourcemapExcludeSources: false,
      banner: `window.__ModuleLoader__.load({ id: 'dsh-shutdown', factory: (require) => {`,
      footer: 'return module.exports; } });',
      intro: 'var module = { exports: {} }; var exports = module.exports;',
    },
  },
])
