/**
 * 本插件对 dsh 宿主服务的最小结构声明。
 *
 * 仅覆盖本插件实际调用的 API 面（依据官方文档 docs/subsystems/slots.md、
 * packages/client/connection/README.md、docs/cookbook/adding-a-settings-card.md
 * 以及官方示例插件 session-log-export 的公开用法）。类型仅在编译期使用，
 * 运行时全部由 dsh 宿主（Host 半）或浏览器 loader（Client 半）提供。
 */

/** 偏好节的形状：Host 半 schema 与 Client 半 scope 的通用约定。 */
export interface ShutdownSettings {
  /** true = 点击「关闭」按钮不再弹确认 */
  skipConfirm: boolean
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

/**
 * settings 子系统对 schema 的最小使用面（duck-typed schemastery 节点）。
 * 1. 作为函数调用：校验合并后的候选节并应用默认值（register、每次写入、外部手改均走此路径）；
 * 2. toJSON()：describe 时序列化为 wire envelope，客户端以 `new Schema(envelope)` 还原；
 * 3. redactSecrets 按 type/meta/dict/inner 结构遍历——本插件无 secret 字段，
 *    live 对象不声明这些属性时按 default 分支直通。
 */
export interface SettingsSchemaLike<T> {
  (data: unknown): T
  toJSON(): unknown
}

/** Host 半 settings 服务：注册命名空间后即可读/写/持久化到 dsh 的 settings.yaml。 */
export interface SettingsService {
  register(namespace: string, schema: SettingsSchemaLike<unknown>): unknown
}

/** Client 半命名空间作用域的同步快照。 */
export interface SettingsScopeSnapshot<T> {
  /** loading = 首次读取未完成；ready = 有已接受的节；unavailable = 命名空间不可用或不可持久化 */
  status: 'loading' | 'ready' | 'unavailable'
  /** 最近一次接受的节（应用默认值后）；ready 前为 undefined */
  value: T | undefined
  /** 宿主文档是否接受写入 */
  writable: boolean
}

/** Client 半命名空间作用域：镜像 Host 注册节，写入带 revision 乐观锁。 */
export interface SettingsScope<T> {
  getSnapshot(): SettingsScopeSnapshot<T>
  subscribe(listener: () => void): () => void
  /** 写入单个字段；返回值结算于写入与后续恢复读完成之后 */
  set(field: string, value: unknown): Promise<void>
  /** 清除单个字段，回落到 schema 默认值 */
  unset(field: string): Promise<void>
}

/** Client 半 settingsScope 服务：按命名空间绑定作用域，绑定挂载在调用方生命周期上。 */
export interface SettingsScopeBinder {
  bind<T>(spec: { namespace: string }): SettingsScope<T>
}

/** 浏览器半收到的 cordis 客户端上下文。 */
export interface ClientContext {
  slots: SlotsService
  locale: LocaleService
  /** 偏好持久化作用域（inject 中声明 settingsScope 后保证可用） */
  settingsScope: SettingsScopeBinder
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
  /** 声明可选服务依赖：deps 全部可用时以同构 ctx 执行 callback，服务缺席时回调不执行 */
  inject(deps: readonly string[], callback: (ctx: HostContext) => void): void
  /** settings 子系统；经 inject(['settings']) 保证可用，其余时机保持可选 */
  settings?: SettingsService
  effect(factory: EffectFactory, label?: string): unknown
}
