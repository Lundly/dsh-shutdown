# dsh-shutdown

面向 DeepSeek Harness web 端的一键关闭插件：在 Session 头部右上角新增一个与关闭按钮，经确认后**安全结束整个 dsh 进程**（走 launcher 的 `ctx.appExit`，先 dispose 整棵 Cordis 树再退出），并尝试关闭浏览器页面；若标签页未关闭，页面会渲染「dsh 已关闭」画面兜底。

特性：

- 顶部「关闭」胶囊按钮。
- 点击后弹出确认对话框，含「不再显示」选项；勾选后下次点击直接关闭。
- 「设置 → General」中提供重新开启确认提示的开关。
- 进程安全退出；标签页未能关闭时渲染全屏已关闭画面。

## 布局要求

本仓库是独立的插件 git 仓库，需与 `deepseek-harness` checkout **平级**，插件引用 dsh 源码的类型与打包产物：

```
deepseek\
├── deepseek-harness\     # fork：保持干净，随时同步上游
└── dsh-shutdown\         # ★ 本插件仓库
```

## 本地开发

前置：Node ^22.19 或 ≥24，pnpm 可用，fork 已完成 `pnpm install && pnpm run build`（插件通过 tsc 项目引用继承 fork 的类型图）。

```sh
cd ../deepseek-harness && pnpm install && pnpm run build
cd ../dsh-shutdown
pnpm install && pnpm run typecheck
pnpm run build            # 产出 lib/index.js + lib/client.js
```

## 安装与验证

**快速迭代**（免安装，tsx 直跑源码；建一个临时 overlay 引用本插件 host 源码）：

```yaml
# overlay.cordis.yml
- insert:
    - id: shutdown
      name: 'path/to/dsh-shutdown/src/index.ts'
```

```sh
cd ../deepseek-harness
pnpm dsh web --patch ..\overlay.cordis.yml
```

**组合包全流程**（需要在插件目录先 `pnpm run build`，使 `lib/` 就绪）：

```sh
cd dsh-shutdown
pnpm install && pnpm run build
dsh plugin --profile <名> add .        # 相对路径 spec 锚定到调用目录
dsh --profile <名> --dump-config       # 应出现 "# == dsh-shutdown" 层
dsh --profile <名>                     # 启动后右上角出现关闭按钮
```

> pnpm ≥10 默认拦截 git 安装时的 `prepare` 构建脚本，首次 `add github:...` 会失败并给出 `allowBuilds` 提示；按提示把输出的包键加入该 profile 的 `pnpm-workspace.yaml` 后重试。本地 `add .`（已含 `lib/`）通常无需该授权。

## 说明

- 客户端（浏览器）构建采用自带的 `tsdown` 配置，产出与 dsh-client-modules 兼容的 `lib/client.js`（`window.__ModuleLoader__.load` 工厂 + baseline 外部化）。按钮样式以内联 `--dsw-*` token 复现，无需 CSS 模块管线。
- 关闭动作不暴露模型可见的 `/shutdown` 命令，仅作为明确的用户手势，避免把「杀掉进程」交给 agent。
