/**
 * 「不再显示确认提示」偏好。
 *
 * 持久化到 dsh 目录的 settings.yaml（dsh-shutdown 命名空间节）：Host 半注册
 * 命名空间，浏览器半经 settingsScope 镜像读写，设置页卡片与确认弹窗共享同一份。
 * 作用域未绑定（settings 服务缺席）或不可写时静默退化为每次都确认。
 */
import type { SettingsScope, ShutdownSettings } from '../types'

/** 与 Host 半 src/index.ts 中的 SETTINGS_NAMESPACE 保持一致 */
export const SETTINGS_NAMESPACE = 'dsh-shutdown'

let scope: SettingsScope<ShutdownSettings> | undefined

/** 由 client/index.ts 在 apply 时绑定 settingsScope；此后偏好读写均经由该作用域。 */
export function bindConfirmScope(bound: SettingsScope<ShutdownSettings> | undefined): void {
  scope = bound
}

export function isConfirmSkipped(): boolean {
  return scope?.getSnapshot().value?.skipConfirm === true
}

export function setConfirmSkipped(skipped: boolean): void {
  if (!scope) return
  // 重新开启时用 unset 清除字段，settings.yaml 中不落冗余的 false。
  const write = skipped ? scope.set('skipConfirm', true) : scope.unset('skipConfirm')
  write.catch(() => {
    // 写入失败（不可写、连接中断等）静默：下次关闭仍弹确认
  })
}

/** 订阅偏好变化（加载完成、外部修改、写入回滚）；返回退订函数。 */
export function watchConfirmPreference(listener: () => void): () => void {
  return scope?.subscribe(listener) ?? (() => {})
}
