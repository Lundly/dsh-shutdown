import type { ClientContext, ShutdownSettings } from '../types'
import { NS, dictionaries } from './locales'
import { ShutdownHeaderAction } from './HeaderAction'
import { ShutdownHeroAction } from './HeroAction'
import { SETTINGS_NAMESPACE, bindConfirmScope } from './storage'
import { ShutdownSettingsCard } from './SettingsCard'
import { injectStyles } from './styles'

/**
 * 依赖的浏览器端服务：slots（槽位注册表）、locale（词典注册）、
 * settingsScope（偏好持久化作用域）。remote 携带 settings 的失效转发，
 * 是 settingsScope 订阅的载体（与官方 ui-theme 插件的声明一致）。
 */
export const inject = ['slots', 'locale', 'remote', 'settingsScope']

export function apply(ctx: ClientContext): void {
  injectStyles()

  bindConfirmScope(ctx.settingsScope?.bind<ShutdownSettings>({ namespace: SETTINGS_NAMESPACE }))

  ctx.effect(() => {
    ctx.locale.register(NS, dictionaries)
  }, 'dsh-shutdown: locale dictionaries')

  // 顶栏关闭按钮：与「Session 日志」下载按钮同槽（右侧工具区，升序排列），
  // order 取大值确保排在其右边——即整个界面最右上角。
  ctx.slots.inject('conversation.session.header.utilities', () =>
    ctx.slots.register(
      {
        name: 'conversation.session.header.utilities',
        id: 'dsh-shutdown',
        order: 10000,
        locale: NS,
      },
      ShutdownHeaderAction,
    ),
  )

  // 浮层关闭按钮：新建会话（hero/blank 相位）时宿主隐藏整个会话头部，
  // 顶栏槽位不会被渲染——故在全局浮层 shell.overlay 补一个入口，仅在
  // hero 相位渲染右上角按钮，普通会话相位自动隐藏以避免与顶栏按钮重叠。
  ctx.slots.inject('shell.overlay', () =>
    ctx.slots.register(
      {
        name: 'shell.overlay',
        id: 'dsh-shutdown',
        order: 10000,
        locale: NS,
      },
      ShutdownHeroAction,
    ),
  )

  // 设置页 → Plugin configuration：卡片用于重新开启「关闭前确认提示」。
  ctx.slots.inject('settings.general.item', () =>
    ctx.slots.register(
      {
        name: 'settings.general.item',
        id: 'dsh-shutdown',
        order: 120,
        key: NS,
        locale: NS,
      },
      ShutdownSettingsCard,
    ),
  )
}
