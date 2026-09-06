export const NS = 'dsh-shutdown'

const zh: Record<string, string> = {
  'header.action': '关闭',
  'header.tooltip': '关闭 DSH',
  'dialog.title': '关闭 DSH',
  'dialog.description': '确认要关闭 DSH 吗？DSH 进程将安全退出，当前标签页会尝试自动关闭',
  'dialog.dontAsk': '不再显示提示（可在通用设置中重新开启）',
  'dialog.confirm': '确认关闭',
  'dialog.cancel': '取消',
  'dialog.error': '关闭请求未被 DSH 确认，请重试，或在启动 DSH 的终端中手动关闭',
  'screen.closing': '正在关闭 DSH…',
  'screen.closed': 'DSH 已关闭',
  'screen.hint': '浏览器标签页未能自动关闭，您可以手动关闭本标签页',
  'settings.title': '关闭 DSH',
  'settings.description': '控制点击「关闭」按钮时是否弹出确认提示',
}

const en = {
  'header.action': 'Close',
  'header.tooltip': 'Shut down DSH',
  'dialog.title': 'Shut down DSH',
  'dialog.description': 'Shut down DSH? The DSH process will exit safely and this tab will try to close itself',
  'dialog.dontAsk': "Don't ask again (re-enable in GeneralSettings)",
  'dialog.confirm': 'Shut down',
  'dialog.cancel': 'Cancel',
  'dialog.error': 'The shutdown request was not confirmed by DSH. Please retry, or stop DSH in its terminal',
  'screen.closing': 'Shutting down DSH…',
  'screen.closed': 'DSH has been shut down',
  'screen.hint': 'This tab could not close itself. You can close it manually',
  'settings.title': 'Shut down DSH',
  'settings.description': 'Whether clicking the "Close" button asks for confirmation first',
}

export const dictionaries: Record<string, Record<string, string>> = { zh, en }

export type Translator = (key: string) => string

export function detectLocale(): 'zh' | 'en' {
  try {
    const lang = typeof navigator !== 'undefined' ? navigator.language : ''
    return (lang || '').toLowerCase().startsWith('zh') ? 'zh' : 'en'
  } catch {
    return 'zh'
  }
}

/** 翻译函数兜底：槽位注入的 t 缺失或抛错时退回本地词典。 */
export function createFallbackT(locale: 'zh' | 'en' = 'zh'): Translator {
  const dict = dictionaries[locale] ?? zh
  return (key) => dict[key] ?? zh[key] ?? key
}

/** 组合槽位注入的 t 与本地兜底。 */
export function composeT(t: Translator | undefined, locale: 'zh' | 'en' = 'zh'): Translator {
  const fallback = createFallbackT(locale)
  return (key) => {
    try {
      return t?.(key) || fallback(key)
    } catch {
      return fallback(key)
    }
  }
}
