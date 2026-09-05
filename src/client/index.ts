import type { ClientContext } from '../types'
import { NS, dictionaries } from './locales'
import { ShutdownHeaderAction } from './HeaderAction'
import { ShutdownSettingsCard } from './SettingsCard'
import { injectStyles } from './styles'

/** 依赖的浏览器端服务：slots（槽位注册表）与 locale（词典注册） */
export const inject = ['slots', 'locale']

export function apply(ctx: ClientContext): void {
  injectStyles()

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
