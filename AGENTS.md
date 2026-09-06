# AGENTS.md

`Deepseek Harness`（以下简称 **dsh**）是由 DeepSeek 团队推出的开源智能体框架。本项目是一个独立的 dsh 插件仓库。

## 关于本项目

本项目提供的插件功能为在 dsh web界面中提供一个关闭按钮，按下关闭按钮后可以关闭当前浏览器的 dsh 标签页并结束 dsh 后台进程。

具体的详细细节如下：
- 关闭按钮位于整个界面的右上角
- 点击关闭按钮后会有弹窗确认，该弹窗有不再显示的勾选框，勾选后下次关闭不再会弹出此窗口
- 弹窗不再显示可以在设置中启用或禁用
- 当浏览器标签页不是由程序打开时，script脚本关闭标签页会失败，此时会在界面中渲染 dsh 已经关闭的提示
- 插件 id：`dsh-shutdown`
- 插件形态：函数插件 / 含 UI 的 Web 插件

## dsh 架构简介

dsh 是构建在 [Cordis](https://github.com/cordiverse) 之上的**全插件 agent harness**：模型适配器、工具注册表、会话日志、甚至 agent 主循环本身都是插件。没有特权核心，扩展的方式就是"在插件旁边再挂一个插件"。开发插件前应建立以下心智模型：

- **插件与上下文（Context）**：插件是 `apply(ctx)` 函数（或 Service 类），`ctx` 是服务的仓库。插件通过 `inject: ['tools']` 声明依赖的服务，Cordis 等服务就绪后才激活插件；激活顺序由依赖关系决定。
- **注册即 effect**：一切贡献都通过 `ctx.effect()` / `ctx.on()` / `ctx.waterfall()` 注册，返回 disposer，插件卸载时自动回滚。
- **事件是扩展点**：事件分三个域——Session 事件（持久、模型可见的事实）、Agent 事件（`agent/*`，观察/拦截进行中的工作）、能力事件（`tools/*`、`fs/*` 等）。事件类型通过 `declare module '@deepseek-ai/cordis'` 的 declaration merging 获得类型。**waterfall 监听器必须调用 `next()`**，否则短路整条链。
- **能力接缝（capability seam）**：可替换能力由三角角色构成——Service Definition（声明接口的抽象类）、Service Provider（具体实现）、Consumer（使用方）。替换 Provider 即替换整个产品行为。
- **会话日志是模型上下文的唯一来源**："模型可见 ⟺ 已记录"。任何要到达模型请求的内容必须能从会话日志重建；新增模型可见输入需要扩展 `SessionEventMap` 并在日志中渲染。
- **组合机制**：运行时的 dsh 是按层叠加的插件树（内置 bundle → profile → home 级 → `--patch` 覆盖层），后层按行胜出；patch 替换目标行的整个 `config` 值，不深合并。本插件通过仓库根目录的 `cordis.patch.yml` 声明自己的配置层。

深入资料（dsh 源码参考策略）：

- **首选同级源码目录**：源码仓库 `../deepseek-harness/` 与本项目平级时，直接查阅本地文档。
- **同级没有源码目录时**，先向用户询问源码位置，得到位置后再按相对路径查阅。
- **用户不提供时**，改为在 GitHub 中检索 DeepSeek Harness 官方仓库，查阅线上对应文档。

本地参考文档（路径按实际源码位置调整）：

- `../deepseek-harness/docs/architecture.md` — 系统总图与扩展点表
- `../deepseek-harness/docs/cordis-primer.md` — Cordis 核心概念
- `../deepseek-harness/docs/cookbook/adding-a-tool.md` — 添加工具的动手模板

## 插件开发 API 简介

插件的最小形态是函数插件，不含默认导出：

```ts
import { Schema } from 'schemastery'
import type { Context } from '@deepseek-ai/cordis'
// 服务类型增强二选一：已添加服务包依赖时导入其类型触发 ctx.<service> 增强，例如：
// import type {} from '@deepseek-ai/dsh-tools'
// 未添加依赖时自行声明用到的接口（写法见下方「依赖策略」）

export const name = '<plugin-id>'

// 需要服务时声明依赖：
// export const inject = ['tools']

// 需要配置时导出同名 Schemastery schema：
// export const Config = Schema.object({})

export function apply(ctx: Context) {
  // 所有注册都是 effect，可逆
}
```

常用扩展点速查：

| 目标 | API |
|---|---|
| 注册模型工具 | `ctx.tools.register(defineTool({ name, description, parameters, execute }))` |
| 注册类命令 | `ctx.commands.register()` |
| 接入模型提供方 | `ctx.llm.registerAdapter()` |
| 监听事件 | `ctx.on('<事件名>', callback)` |
| 拦截/改写请求与回合 | `agent/*`、`tools/*` waterfall 事件 |
| 可选服务 | `ctx.get('<name>')`（`ctx.<name>` 属性访问只留给已声明的 inject） |

注意事项：

- 函数式插件**不要加 default 导出**，混用两种形式会导致 Loader 丢弃 `inject` 等元数据。
- 部署环境可能不同的取值一律做成 `Config` schema 字段，不写硬编码常量。
- 配置装载失败要"响亮失败"，不要静默跳过。

## 依赖策略

- 包管理器使用 **pnpm**；Node 版本 `^22.19.0 || >=24.0.0`。
- **插件开发必须不依赖 dsh 源码**：`deepseek-harness` 源码仅作阅读参考，插件的运行时与构建产物不得 import 源码路径、不得以源码仓库为依赖。插件需要的一切能力都来自宿主运行时与已发布的 `@deepseek-ai/dsh-*` 包。
- 常规情况下 **`@deepseek-ai/cordis` 是必须依赖**，它提供插件开发的基本上下文（`Context`）功能与插件生命周期机制。
- 涉及 UI 开发（React 界面）时需要 **`react`** 依赖。
- 以上依赖必须**同时在 `devDependencies` 和 `peerDependencies` 中声明**：`peerDependencies` 声明运行时由宿主提供、版本与宿主对齐；`devDependencies` 供本仓库类型检查与构建使用。

```jsonc
{
  "peerDependencies": {
    "@deepseek-ai/cordis": "<与 deepseek-harness 当前版本对齐>",
    "react": "<涉及 UI 时声明>"
  },
  "devDependencies": {
    "@deepseek-ai/cordis": "<与 peerDependencies 相同>",
    "react": "<涉及 UI 时声明>"
  }
}
```

- 版本范围照抄 `deepseek-harness` 当前状态。
- 其他 `@deepseek-ai/dsh-*` 服务包的依赖遵循下面的**接口声明优先**策略。

### 服务包依赖：接口声明优先

需要某个 dsh 服务包（如 `@deepseek-ai/dsh-tools`）提供的能力时，按以下顺序决策：

1. **默认不添加依赖**：在插件内部自行声明所用到的 API 接口（`interface`），只描述实际用到的成员。插件通过 `ctx.<service>` 拿到的对象在运行时天然满足这些接口，自行声明使插件与服务包的具体类型零耦合，依赖树保持最小。
2. **用到的 API 很多、自行声明变得臃肿时**，才考虑添加对应服务包依赖，并遵循上面的双声明（`peerDependencies` + `devDependencies`）策略。

自行声明接口的示例：

```ts
// 不添加 @deepseek-ai/dsh-tools 依赖，只声明实际用到的成员：
interface ToolRegistry {
  register(tool: UnknownTool): () => void
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    tools: ToolRegistry
  }
}
```

> 代价与权衡：自行声明意味着服务包 API 变更时编译期不会自动提示，需要在使用该能力的测试中覆盖；接口面一旦超过几个方法，维护声明的成本会超过依赖的成本，此时切换为真实依赖。

## 关键命令

```sh
pnpm install        # 安装依赖
pnpm run build      # 构建（tsc -b && tsdown）
pnpm run typecheck  # 类型检查
```

## 本地调试

dsh 插件通过 `corids.patch.yml` 文件挂载，开发时快速验证参考以下模板挂载：

```yaml
- insert:
    - id: <plugin-id>
      name: 'file:///<插件仓库绝对路径>/src/index.ts'
```

`name` 使用入口 ts 文件的绝对路径，Windows 下需加 `file:///` 前缀

完成开发发布时的配置需要将 `name` 改为插件名

完整流程验证：`pnpm run build` 后 `dsh plugin --profile <profile> add .`，再用 `dsh --profile <profile> --dump-config` 确认配置层已生效。

> 代理时不执行插件安装命令