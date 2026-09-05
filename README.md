# dsh-shutdown

为 [DeepSeek Harness (dsh)](https://github.com/deepseek-ai/deepseek-harness) 的 Web UI 添加**右上角关闭按钮**的插件：

- 在 Web 界面右上角新增一个「关闭」按钮
- 点击后弹出确认提示（可选择「不再显示」，之后点击按钮将直接关闭；可在设置中重新开启）
- 确认后**安全结束整个 dsh 进程**（走 dsh launcher 的优雅退出路径：插件树逆序清理、Web 服务关闭后进程退出），并尝试自动关闭浏览器标签页
- 若浏览器策略阻止脚本关闭标签页，页面会渲染「dsh 已安全关闭」的兜底画面，提醒你手动关闭标签页

## 安装（本地目录方式）

在本仓库的**上级目录**执行（首次会自动创建名为 `shutdown` 的 profile，并把本插件作为 bundle 追加进去）：

```sh
dsh plugin --profile web add ./dsh-shutdown
```

> 相对路径以执行命令时所在目录为锚点，也可以直接用绝对路径。

验证安装：

```sh
dsh plugin --profile web list
```

启动 dsh 后浏览器打开 Web 界面，即可在右上角看到「关闭」按钮。

### 移除

```sh
dsh plugin --profile web remove dsh-shutdown
```

bundle 成员变化需重启 profile 后生效。

## 从源码构建

```sh
pnpm install   # 仅构建工具（tsdown / typescript / 类型声明），install 时自动 prepare 构建
pnpm build     # 产物：lib/index.js（Host 半，Node ESM）+ lib/client.js（浏览器半，ModuleLoader CJS 工厂）
pnpm typecheck
```

本插件不依赖 dsh 源码即可构建：宿主提供的包（`@deepseek-ai/cordis`、`react` 等）全部以 peer/external 方式声明，运行时分别由 dsh 宿主与浏览器端模块加载器注入，产物零第三方运行时代码。

## License

MIT
