import type { AppExit, HostContext, SettingsSchemaLike, ShutdownSettings } from './types'

export const name = 'dsh-shutdown'

/** 与浏览器半 src/client/storage.ts 中的 SETTINGS_NAMESPACE 保持一致 */
const SETTINGS_NAMESPACE = 'dsh-shutdown'

/** 与浏览器半 src/client/shutdown.ts 中的 EXIT_ROUTE 保持一致 */
const EXIT_ROUTE = '/api/dsh-shutdown.exit'

/** 请求退出后等待进程自行结束的上限，超过则强制退出 */
const FORCE_EXIT_GRACE_MS = 8_000

export const inject = ['connection']

/**
 * 构造「不再显示确认提示」命名空间的 settings schema（duck-typed，约定见 types.ts
 * 的 SettingsSchemaLike）。纯函数构造，不引入 schemastery 依赖。
 */
function createShutdownSettingsSchema(): SettingsSchemaLike<ShutdownSettings> {
  const schema: SettingsSchemaLike<ShutdownSettings> = (data) => {
    const section = typeof data === 'object' && data !== null && !Array.isArray(data)
      ? data as Record<string, unknown>
      : {}
    const raw = section['skipConfirm']
    if (raw !== undefined && raw !== null && typeof raw !== 'boolean') {
      throw new TypeError(`settings "${SETTINGS_NAMESPACE}.skipConfirm" must be a boolean`)
    }
    return { skipConfirm: raw === true }
  }
  // wire envelope 与 schemastery schema.toJSON() 的 {uid, refs} 格式同构：
  // 客户端 settingsScope 读取时以 new Schema(envelope) 还原并校验节值。
  schema.toJSON = () => ({
    uid: 0,
    refs: {
      0: { type: 'object', dict: { skipConfirm: 1 }, meta: {} },
      1: { type: 'boolean', meta: { default: false } },
    },
  })
  return schema
}

export function apply(ctx: HostContext): void {
  // 注册偏好命名空间：写入自动持久化到 dsh 的 settings.yaml（dsh-shutdown 节），
  // 外部手改该文件也会热同步到浏览器。非 web 宿主无 settings 服务，回调不执行，
  // 偏好退化为每次都弹确认。
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.settings?.register(SETTINGS_NAMESPACE, createShutdownSettingsSchema())
  })

  ctx.connection.fetch.register({
    path: EXIT_ROUTE,
    methods: ['POST'],
    requestBody: 'buffered',
    fetch: async () => {
      // 先把响应送回浏览器（浏览器半在收到 2xx 后才尝试关标签页/显示兜底画面），
      // 再请求退出——dispose 会立刻断开所有浏览器连接。
      setTimeout(() => requestExit(ctx), 50)
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    },
  })
}

/** 仅登记一次退出兜底，重复的退出请求不再叠加监听器与定时器 */
let exitRequested = false

/**
 * 结束 dsh 进程：请求优雅退出（launcher 的 appExit，缺席时退回 SIGTERM），
 * 并在事件循环排空时或超过 FORCE_EXIT_GRACE_MS 后退出进程。
 */
function requestExit(ctx: HostContext): void {
  let exit: AppExit | undefined
  try {
    exit = ctx.get('appExit') as AppExit | undefined
  } catch {
    exit = undefined
  }

  if (!exitRequested) {
    exitRequested = true
    process.on('beforeExit', () => {
      process.exit(0)
    })
    const cap = setTimeout(() => {
      process.exit(0)
    }, FORCE_EXIT_GRACE_MS)
    cap.unref?.()
  }

  if (typeof exit === 'function') {
    exit(0)
    return
  }
  try {
    process.kill(process.pid, 'SIGTERM')
  } catch {
    // ignore：信号不可用时由上方兜底定时器退出
  }
}
