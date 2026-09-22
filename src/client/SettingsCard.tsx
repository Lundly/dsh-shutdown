import { useEffect, useState } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { composeT, type Translator } from './locales'
import { isConfirmSkipped, setConfirmSkipped, watchConfirmPreference } from './storage'
import { cls } from './styles'

export interface SettingsCardProps {
  t?: Translator
  [key: string]: unknown
}

/**
 * 设置页插件卡片（settings.general.item 槽位）：重新开启「关闭前确认提示」。
 * 与确认弹窗读写同一份偏好（当前 profile 的 dsh-shutdown 插件配置）。
 */
function SettingsCardInner({ t }: SettingsCardProps) {
  const tr: Translator = composeT(t)
  const [confirmOn, setConfirmOn] = useState(() => !isConfirmSkipped())

  // 订阅条目表单：首次读取完成、外部（其他窗口或手改 profile patch）修改、
  // 写入失败回滚都会同步到勾选框。
  useEffect(() => watchConfirmPreference(() => setConfirmOn(!isConfirmSkipped())), [])

  return (
    <div className={cls.settingsRow}>
      <div className={cls.settingsRowText}>
        <div className={cls.settingsTitle}>{tr('settings.title')}</div>
        <div className={cls.settingsDesc}>{tr('settings.description')}</div>
      </div>
      <label className={cls.settingsCheck}>
        <input
          type="checkbox"
          checked={confirmOn}
          onChange={(event) => {
            const on = event.currentTarget.checked
            setConfirmOn(on)
            setConfirmSkipped(!on)
          }}
        />
      </label>
    </div>
  )
}

export function ShutdownSettingsCard(props: SettingsCardProps) {
  return (
    <ErrorBoundary>
      <SettingsCardInner {...props} />
    </ErrorBoundary>
  )
}
