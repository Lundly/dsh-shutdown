/**
 * 「不再显示确认提示」偏好。
 *
 * 存储在浏览器 localStorage：与确认弹窗同源同浏览器，设置页卡片读写同一份，
 * 行为见 README。存储不可用（隐私模式等）时静默退化为每次都确认。
 */
const STORAGE_KEY = 'dsh-shutdown.skipConfirm'

export function isConfirmSkipped(): boolean {
  try {
    return globalThis.localStorage?.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function setConfirmSkipped(skipped: boolean): void {
  try {
    const storage = globalThis.localStorage
    if (!storage) return
    if (skipped) storage.setItem(STORAGE_KEY, '1')
    else storage.removeItem(STORAGE_KEY)
  } catch {
    // 存储不可用时忽略
  }
}
