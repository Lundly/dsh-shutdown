import type { ClientContext, ShutdownSettings } from '../types'
import { NS, dictionaries } from './locales'
import { ShutdownAction } from './Action'
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

  // 关闭按钮：shell.overlay 是 root scope 的常驻浮层，会话存在与否都会渲染，
  // 按钮自身在浮层内绝对定位到界面右上角（样式见 styles.ts）。
  ctx.slots.inject('shell.overlay', () =>
    ctx.slots.register(
      {
        name: 'shell.overlay',
        id: 'dsh-shutdown',
        order: 10000,
        locale: NS,
      },
      ShutdownAction,
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
