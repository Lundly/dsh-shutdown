/**
 * 本插件对 dsh 宿主服务的最小结构声明。
 *
 * 仅覆盖本插件实际调用的 API 面（依据官方文档 docs/subsystems/settings.zh.md、
 * docs/user/develop/basic/config.zh.md、docs/cookbook/adding-a-settings-card.zh.md
 * 以及 packages/client/ui-settings 的公开用法）。类型仅在编译期使用，
 * 运行时全部由 dsh 宿主（Host 半）或浏览器 loader（Client 半）提供。
 */

/** 偏好节的形状：Host 半 Config schema 与 Client 半表单的通用约定。 */
export interface ShutdownSettings {
  /** true = 点击「关闭」按钮不再弹确认 */
  skipConfirm: boolean
}

/**
 * Config 中声明为 volatile 的字段解析出的稳定引用，值经 `.get()` 读取。
 * 结构声明与 @deepseek-ai/cosmokit 的 Volatile 一致，避免依赖 cordis 的再导出。
 */
export interface Volatile<T> {
  get(): T
}

/** 把 JSON 兼容值写进某个设置命名空间的路径操作。 */
export interface SettingsPathOperation {
  op: 'set' | 'unset'
  path: string[]
  value?: unknown
}

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
  /** list 卡片升序排序，越大越靠后 */
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

/** 单个设置命名空间的同步快照。 */
export interface ConfigFormSnapshot<T> {
  /** loading = 首次读取未完成；ready = 有已接受的节；unavailable = 命名空间不可用或连接保持进程内偏好 */
  status: 'loading' | 'ready' | 'unavailable'
  /** 最近一次接受的节（schema 解析后）；ready 前为 undefined */
  value: T | undefined
  /** 继承层（组合默认值）：清除字段后回落到的值 */
  base: unknown
  /** 已存储的用户层；字段在该层中「存在」即表示被覆盖 */
  user: unknown
  /** 下一次写入的修订栅栏 */
  revision: number | undefined
  /** 宿主文档是否接受写入 */
  writable: boolean
  /** host = 持久化到宿主文档；memory = 仅保留在浏览器进程内 */
  mode: 'host' | 'memory'
}

/**
 * 一个 Host 插件条目的共享表单：已接受的值与排序后的写入队列，
 * 由该条目的所有编辑者共用。
 */
export interface ConfigForm<T> {
  getSnapshot(): ConfigFormSnapshot<T>
  /** 订阅快照替换；返回退订函数 */
  subscribe(listener: () => void): () => void
  /** 提交一次原子路径操作；返回宿主是否接受 */
  mutate(operations: readonly SettingsPathOperation[], expectedRevision?: number): Promise<boolean>
  /** 写入单个字段；返回宿主是否接受 */
  set(field: string, value: unknown): Promise<boolean>
  /** 清除单个字段，回落到继承层；返回宿主是否接受 */
  unset(field: string): Promise<boolean>
}

/** Client 半 configForms 服务：按 profile 条目 id 取得该条目的共享表单。 */
export interface ConfigFormsService {
  get<T>(entryId: string): ConfigForm<T>
}

/** 浏览器半收到的 cordis 客户端上下文。 */
export interface ClientContext {
  slots: SlotsService
  locale: LocaleService
  /** 当前 profile 条目的设置表单（inject 中声明 configForms 后保证可用） */
  configForms: ConfigFormsService
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
