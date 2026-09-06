import { composeT, detectLocale, type Translator } from './locales'
import { ShutdownScreen } from './ShutdownScreen'
import { cls } from './styles'
import { ConfirmDialog } from './ConfirmDialog'
import { ErrorBoundary } from './ErrorBoundary'
import { useShutdownFlow } from './useShutdownFlow'

export interface HeaderActionProps {
  t?: Translator
  [key: string]: unknown
}

/** 叉号图标：与「Session 日志」按钮的图标尺寸一致（12px）。 */
export function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function HeaderActionInner(props: HeaderActionProps) {
  const tr: Translator = composeT(props.t, detectLocale())
  const flow = useShutdownFlow()

  return (
    <>
      <button
        type="button"
        className={cls.btn}
        title={tr('header.tooltip')}
        aria-label={tr('header.tooltip')}
        onClick={flow.open}
      >
        <span>{tr('header.action')}</span>
        <CloseIcon />
      </button>
      {(flow.phase === 'confirm' || flow.phase === 'error') && (
        <ConfirmDialog
          t={tr}
          error={flow.phase === 'error'}
          onCancel={flow.cancel}
          onConfirm={flow.confirm}
        />
      )}
      {flow.screen && <ShutdownScreen t={tr} />}
    </>
  )
}

/** 顶栏「关闭 dsh」按钮：注册在 conversation.session.header.utilities 槽位。 */
export function ShutdownHeaderAction(props: HeaderActionProps) {
  return (
    <ErrorBoundary>
      <HeaderActionInner {...props} />
    </ErrorBoundary>
  )
}
