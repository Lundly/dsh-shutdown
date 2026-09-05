/**
 * 本插件对 dsh 宿主服务的最小结构声明。
 *
 * 仅覆盖本插件实际调用的 API 面（依据官方文档 docs/subsystems/slots.md、
 * packages/client/connection/README.md、docs/cookbook/adding-a-settings-card.md
 * 以及官方示例插件 session-log-export 的公开用法）。类型仅在编译期使用，
 * 运行时全部由 dsh 宿主（Host 半）或浏览器 loader（Client 半）提供。
 */

/** cordis effect：工厂函数，可返回清理函数（同步或异步）。 */
export type EffectFactory = () => void | (() => void) | Promise<void> | (() => Promise<void>)

export interface SlotRegistration {
  readonly id?: string
  readonly key?: string
}

export interface SlotRegisterOptions {
  /** 槽位全名，如 `conversation.session.header.utilities` */
  name: string
  /** list 卡片的寻址 id */
  id?: string
  /** keyed 卡片的寻址 key（如 `settings.plugin.item` 的 settings namespace） */
  key?: string
  /** list 卡片升序排序，越大越靠后（右侧工具区中即越靠右） */
  order?: number
  /** 关联的 locale 命名空间；设置后组件 props 中会注入翻译函数 t */
  locale?: string
  /** 向组件注入额外的数据与回调 */
  inject?: () => Record<string, unknown>
}

export interface SlotsService {
  /** 声明本插件要占用某个槽位；register 回调在渲染时被征询 */
  inject(key: string, register: () => SlotRegistration | void): void
  register(options: SlotRegisterOptions, component: unknown): SlotRegistration
}

export interface LocaleService {
  register(namespace: string, dictionaries: Record<string, Record<string, string>>): unknown
}

/** 浏览器半收到的 cordis 客户端上下文。 */
export interface ClientContext {
  slots: SlotsService
  locale: LocaleService
  effect(factory: EffectFactory, label?: string): unknown
}

export interface ConnectionFetchRoute {
  /** 挂在 /api Fetch 桥下的路径（自动携带认证与 Host/Origin 信任检查） */
  path: string
  methods: string[]
  requestBody?: 'buffered' | 'stream'
  fetch: (request: Request) => Response | Promise<Response>
}

export interface ConnectionService {
  fetch: {
    register(route: ConnectionFetchRoute): () => void
  }
}

/** launcher（dsh web / dsh --profile）提供的可选服务：请求进程在插件树卸载后退出。 */
export type AppExit = (code: number) => void

/** Host 半收到的 cordis 服务端上下文。 */
export interface HostContext {
  connection: ConnectionService
  /** 读取可选服务（如 appExit）；不存在时返回 undefined */
  get(key: string): unknown
  effect(factory: EffectFactory, label?: string): unknown
}
