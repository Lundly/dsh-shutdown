import type { ClientContext, ShutdownSettings } from '../types'
import { NS, dictionaries } from './locales'
import { ShutdownAction } from './Action'
import { SETTINGS_ENTRY_ID, bindConfirmForm } from './storage'
import { ShutdownSettingsCard } from './SettingsCard'
import { injectStyles } from './styles'

/**
 * 依赖的浏览器端服务：slots（槽位注册表）、locale（词典注册）、
 * configForms（当前 profile 条目的设置表单，读写「不再显示确认提示」）。
 */
export const inject = ['slots', 'locale', 'configForms']

export function apply(ctx: ClientContext): void {
  injectStyles()

  bindConfirmForm(ctx.configForms.get<ShutdownSettings>(SETTINGS_ENTRY_ID))

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

  // 设置页 → 通用分区：卡片用于重新开启「关闭前确认提示」。
  ctx.slots.inject('settings.general.item', () =>
    ctx.slots.register(
      {
        name: 'settings.general.item',
        id: 'dsh-shutdown',
        order: 90,
        locale: NS,
      },
      ShutdownSettingsCard,
    ),
  )
}
