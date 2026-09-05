import { defineConfig } from 'tsdown'

// 浏览器半（client bundle）的 externals。
// 这些模块不会被打进产物：平台模块（react、cordis、静态 UI 库）由 loader 注入的
// require 在浏览器端从冻结的平台模块表解析；inject 列出的 client bundle 由
// boot graph 顺序保证先于本包加载（与 package.json 的 dsh.client.inject 对应）。
const clientExternals = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-ui-primitives',
  '@deepseek-ai/dsh-client-web-react',
  '@deepseek-ai/dsh-client-ui-attachment',
  '@deepseek-ai/dsh-client-schema-form',
  '@deepseek-ai/dsh-client-ui-conversation',
  '@deepseek-ai/dsh-client-runtime/client',
]

export default defineConfig([
  // Host 半：Node ESM，供 dsh loader 直接 import
  {
    entry: ['src/index.ts'],
    outDir: 'lib',
    format: 'esm',
    platform: 'node',
    target: 'es2024',
    dts: false,
    outputOptions: {
      // 固定输出文件名（package.json exports 指向 lib/index.js）
      entryFileNames: 'index.js',
    },
  },
  // 浏览器半：lazy-CJS 工厂产物（loader 约定格式，仓外插件需自行复现）：
  //   window.__ModuleLoader__.load({ id: "<pkg>", factory: (require) => { ...; return module.exports; } })
  {
    entry: { client: 'src/client/index.tsx' },
    outDir: 'lib',
    format: 'cjs',
    platform: 'browser',
    target: 'es2024',
    external: clientExternals,
    outputOptions: {
      entryFileNames: 'client.js',
      banner:
        'window.__ModuleLoader__.load({ id: "dsh-shutdown", factory: (require) => { var module = { exports: {} }; var exports = module.exports;',
      footer: 'return module.exports; } });',
    },
  },
])
