/** Locale namespace owned by the dsh-shutdown browser UI. */
export const NS = 'dsh-shutdown'

/** Simplified-Chinese dsh-shutdown strings. */
export const zh = {
  'header.label': '关闭',
  'header.ariaLabel': '关闭 dsh',
  'dialog.title': '关闭 dsh？',
  'dialog.description': '确认后将安全结束整个 dsh 进程，并尝试关闭当前页面。',
  'dialog.confirm': '确认关闭',
  'dialog.cancel': '取消',
  'dialog.never': '不再显示此提示',
  'overlay.title': 'DSH 已关闭',
  'overlay.description': 'DSH 进程已安全结束，此页面现在可以关闭。',
  'settings.label': '关闭 dsh 前再次确认',
  'settings.hint': '关闭 dsh 前先弹出确认提示。',
  'settings.enable': '恢复确认提示',
  'settings.disabledHint': '已开启“不再显示”，关闭 dsh 前将不再弹出确认。',
} as const

/** English dsh-shutdown strings. */
export const en: Record<keyof typeof zh, string> = {
  'header.label': 'Shutdown',
  'header.ariaLabel': 'Shut down dsh',
  'dialog.title': 'Shut down dsh?',
  'dialog.description': 'This safely ends the entire dsh process and tries to close this page.',
  'dialog.confirm': 'Shut down',
  'dialog.cancel': 'Cancel',
  'dialog.never': "Don't ask again",
  'overlay.title': 'DSH has shut down',
  'overlay.description': 'The DSH process ended safely; you can close this page now.',
  'settings.label': 'Confirm before shutting down dsh',
  'settings.hint': 'Ask for confirmation before shutting down dsh.',
  'settings.enable': 'Restore the confirmation prompt',
  'settings.disabledHint': '"Don\'t ask again" is on; shutdown no longer asks for confirmation.',
}

/** Stable locale keys consumed by the dsh-shutdown UI. */
export type ShutdownLocaleKey = keyof typeof zh
