import { useState, type CSSProperties, type ReactNode } from 'react'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { ShutdownDialogInjected } from './HeaderAction.tsx'
import { NS } from './locales.ts'

export type ShutdownSettingsRowProps =
  PropsRuntime<'settings.general.item'>
  & PropsLocale<typeof NS>
  & InjectFace<ShutdownDialogInjected>

const rowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 10,
  cursor: 'pointer',
  padding: '10px',
  marginRight: '5px'
}

const textStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
}

const labelStyle: CSSProperties = {
  fontSize: 14,
  lineHeight: '20px',
  color: 'var(--dsw-alias-label-primary)',
}

const hintStyle: CSSProperties = {
  fontSize: 12,
  lineHeight: '16px',
  color: 'var(--dsw-alias-label-secondary)',
}

const boxStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between'
}

const checkBoxStyle: CSSProperties = {
    accentColor: 'var(--dsw-alias-brand-primary);',
    width: '18px',
    height: '18px',
    cursor: 'pointer',
}

/**
 * General-settings row that re-enables the shutdown confirmation prompt. The
 * checkbox mirrors the persistent "don't ask again" preference: checked means
 * "confirm before shutting down" (the default), unchecked means skip the prompt.
 * @param props - settings runtime props, localized copy, and injected actions.
 * @returns the preference row.
 */
export function ShutdownSettingsRow(props: ShutdownSettingsRowProps): ReactNode {
  const { useShutdownPrefs, setConfirmDisabled, t } = props
  const [confirmPrefs, setConfirmPrefs] = useState(useShutdownPrefs(state => state.confirmDisabled))

  return (
    <div className="shutdown-prefer" style={boxStyle}>
      <span style={textStyle}>
        <span style={labelStyle}>{t('settings.label')}</span>
        <span style={hintStyle}>{confirmPrefs ? t('settings.disabledHint') : t('settings.hint')}</span>
      </span>
      <label style={rowStyle}>
        <input
          style={checkBoxStyle}
          type="checkbox"
          checked={!confirmPrefs}
          onChange={event => { setConfirmPrefs(!confirmPrefs); setConfirmDisabled(!event.target.checked) }}
        />
      </label>
    </div>
  )
}
