import { isBuiltin } from 'node:module'
import { defineConfig } from 'tsdown'

/**
 * Baseline browser modules the shell shares into the frozen module table
 * (mirror of @deepseek-ai/dsh-client-web/src/platform.ts PLATFORM_MODULES).
 * These stay imports resolved by the injected `require`; everything else
 * inlines, which is what keeps a client bundle free of a second React/Cordis.
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

/**
 * dsh-shutdown build: the Host node half plus the browser Client factory
 * bundle. The client artifact must match the shape `dsh-client-modules`
 * expects — a CJS factory registered on window.__ModuleLoader__.load() whose
 * externals resolve through the injected `require` (the loader module table).
 * @returns tsdown configs for the two halves.
 */
export default defineConfig([
  {
    name: 'dsh-shutdown',
    entry: ['lib/types/index.js'],
    outDir: 'lib',
    format: ['esm'],
    platform: 'node',
    target: 'es2024',
    fixedExtension: false,
    dts: false,
    clean: false,
    deps: {
      neverBundle: (specifier: string) => specifier.startsWith('@deepseek-ai/') || isBuiltin(specifier),
      alwaysBundle: (specifier: string) => !specifier.startsWith('@deepseek-ai/') && !isBuiltin(specifier),
    },
  },
  {
    name: 'dsh-shutdown/client',
    entry: { client: 'lib/types/client/index.js' },
    outDir: 'lib',
    format: ['cjs'],
    platform: 'browser',
    target: 'es2024',
    fixedExtension: false,
    dts: false,
    sourcemap: true,
    clean: false,
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
