import { composeT, detectLocale, type Translator } from './locales'
import { ShutdownScreen } from './ShutdownScreen'
import { cls } from './styles'
import { ConfirmDialog } from './ConfirmDialog'
import { ErrorBoundary } from './ErrorBoundary'
import { useShutdownFlow } from './useShutdownFlow'

export interface ShutdownActionProps {
  t?: Translator
  [key: string]: unknown
}

/** 叉号图标 */
function CloseIcon() {
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

function ActionInner(props: ShutdownActionProps) {
  const tr: Translator = composeT(props.t, detectLocale())
  const flow = useShutdownFlow()

  return (
    <>
      <div className={cls.anchor}>
        <button
          type="button"
          className={cls.action}
          title={tr('header.tooltip')}
          aria-label={tr('header.tooltip')}
          onClick={flow.open}
        >
          <CloseIcon />
        </button>
      </div>
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

/** 界面右上角「关闭 dsh」按钮：注册在 shell.overlay 槽位（全局浮层，任何相位都渲染）。 */
export function ShutdownAction(props: ShutdownActionProps) {
  return (
    <ErrorBoundary>
      <ActionInner {...props} />
    </ErrorBoundary>
  )
}
