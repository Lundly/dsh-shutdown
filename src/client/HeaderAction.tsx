import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store'
import { Button, IconCloseOutline16, Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { NS } from './locales.ts'
import { ShutdownClosedOverlay } from './ShutdownClosedOverlay.tsx'
import type { ShutdownPrefsState } from './ShutdownPrefsController.ts'

/** Browser operations and state injected into the Session Header contribution. */
export interface ShutdownDialogInjected {
  hooks: { shutdownPrefs: ObservableSnapshot<ShutdownPrefsState> }
  setConfirmDisabled: (value: boolean) => void
  beginShutdown: () => void
}

export type ShutdownHeaderActionProps =
  PropsRuntime<'conversation.session.header.utilities'>
  & PropsLocale<typeof NS>
  & InjectFace<ShutdownDialogInjected>

/** Capsule styling matching the Session-log Header button (SessionLogButton.module.css). */
const buttonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 111,
  height: 32,
  padding: '6px 12px',
  gap: 4,
  border: '1px solid var(--dsw-alias-border-l2)',
  borderRadius: 18,
  color: 'var(--dsw-alias-label-primary)',
  background: 'transparent',
  fontFamily: 'var(--dsw-font-family)',
  fontSize: 13,
  fontWeight: 400,
  lineHeight: '20px',
  cursor: 'pointer',
  flex: 'none',
}

const labelStyle: CSSProperties = {
  whiteSpace: 'nowrap',
  flex: 'none',
}

const neverStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  cursor: 'pointer',
}

/**
 * Session Header close button, its confirmation dialog, and the shut-down
 * overlay. Skips the dialog when "don't ask again" is set; otherwise asks, and
 * can persist that preference from the dialog's checkbox.
 * @param props - runtime slot props, localized copy, and injected actions.
 * @returns the header capsule plus its modal and the shut-down overlay.
 */
export function ShutdownHeaderAction(props: ShutdownHeaderActionProps): ReactNode {
  const { useShutdownPrefs, setConfirmDisabled, beginShutdown, t } = props
  const confirmDisabled = useShutdownPrefs(state => state.confirmDisabled)
  const [closed, setClosed] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [never, setNever] = useState(false)

  const onButtonClick = (): void => {
    if (confirmDisabled) {
      beginShutdown()
      return
    }
    setDialogOpen(true)
  }

  const onConfirm = (): void => {
    if (never) setConfirmDisabled(true)
    setDialogOpen(false)
    setClosed(true)
    beginShutdown()
  }

  return (
    <>
      {closed ? <ShutdownClosedOverlay t={t} /> : null}
      <button
        type="button"
        style={buttonStyle}
        onClick={onButtonClick}
        aria-label={t('header.ariaLabel')}
        title={t('header.label')}
      >
        <span style={labelStyle}>{t('header.label')}</span>
        <IconCloseOutline16 size={12} />
      </button>
      <Modal
        open={dialogOpen}
        onClose={() => { setDialogOpen(false) }}
        title={t('dialog.title')}
        description={t('dialog.description')}
        closeLabel={t('dialog.cancel')}
        footer={(
          <>
            <Button variant="ghost" onClick={() => { setDialogOpen(false) }}>{t('dialog.cancel')}</Button>
            <Button variant="primary" onClick={onConfirm}>{t('dialog.confirm')}</Button>
          </>
        )}
      >
        <label style={neverStyle}>
          <input type="checkbox" checked={never} onChange={event => { setNever(event.target.checked) }} />
          <span>{t('dialog.never')}</span>
        </label>
      </Modal>
    </>
  )
}
