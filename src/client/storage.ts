/**
 * 「不再显示确认提示」偏好。
 *
 * 持久化为当前 profile 中 dsh-shutdown 条目的 plugin 配置（Host 半 Config 的
 * volatile 字段 skipConfirm），浏览器半经 configForms 读写同一份表单，
 * 设置页卡片与确认弹窗共享。
 */
import type { ConfigForm, ShutdownSettings } from '../types'

/** 与 Host 半 cordis.patch.yml 中的条目 id 保持一致 */
export const SETTINGS_ENTRY_ID = 'dsh-shutdown'

let form: ConfigForm<ShutdownSettings> | undefined

/** 由 client/index.ts 在 apply 时绑定条目表单；此后偏好读写均经由该表单。 */
export function bindConfirmForm(bound: ConfigForm<ShutdownSettings>): void {
  form = bound
}

export function isConfirmSkipped(): boolean {
  return form?.getSnapshot().value?.skipConfirm === true
}

export function setConfirmSkipped(skipped: boolean): void {
  if (!form) return
  // 重新开启时用 unset 清除字段，profile patch 中不落冗余的 false。
  const write = skipped ? form.set('skipConfirm', true) : form.unset('skipConfirm')
  write.catch(() => {
    // 写入失败（不可写、连接中断等）静默：下次关闭仍弹确认
  })
}

/** 订阅偏好变化（首次读取完成、其他窗口或外部修改、写入失败回滚）；返回退订函数。 */
export function watchConfirmPreference(listener: () => void): () => void {
  return form?.subscribe(listener) ?? (() => {})
}
