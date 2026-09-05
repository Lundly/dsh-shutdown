import { useState } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { composeT, type Translator } from './locales'
import { isConfirmSkipped, setConfirmSkipped } from './storage'
import { cls } from './styles'

export interface SettingsCardProps {
  t?: Translator
  [key: string]: unknown
}

/**
 * 设置页插件卡片（settings.general.item 槽位）：重新开启「关闭前确认提示」。
 * 与确认弹窗读写同一份 localStorage 偏好。
 */
function SettingsCardInner({ t }: SettingsCardProps) {
  const tr: Translator = composeT(t)
  const [confirmOn, setConfirmOn] = useState(() => !isConfirmSkipped())

  return (
    <div className={cls.settings}>
      <h4 className={cls.settingsTitle}>{tr('settings.title')}</h4>
      <p className={cls.settingsDesc}>{tr('settings.description')}</p>
      <label className={cls.settingsRow}>
        <input
          type="checkbox"
          checked={confirmOn}
          onChange={(event) => {
            const on = event.currentTarget.checked
            setConfirmOn(on)
            setConfirmSkipped(!on)
          }}
        />
        <span>{tr('settings.confirm')}</span>
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
