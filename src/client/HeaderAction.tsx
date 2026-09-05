import { useCallback, useState } from 'react'
import { ConfirmDialog } from './ConfirmDialog'
import { ErrorBoundary } from './ErrorBoundary'
import { composeT, detectLocale, type Translator } from './locales'
import { requestAppExit } from './shutdown'
import { ShutdownScreen } from './ShutdownScreen'
import { isConfirmSkipped, setConfirmSkipped } from './storage'
import { cls } from './styles'

export interface HeaderActionProps {
  t?: Translator
  [key: string]: unknown
}

/** 叉号图标：与「Session 日志」按钮的图标尺寸一致（12px）。 */
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

type Phase = 'idle' | 'confirm' | 'error'

function HeaderActionInner(props: HeaderActionProps) {
  const tr: Translator = composeT(props.t, detectLocale())

  const [phase, setPhase] = useState<Phase>('idle')
  const [screen, setScreen] = useState(false)

  const runShutdown = useCallback(async () => {
    const accepted = await requestAppExit()
    if (!accepted) {
      // Host 未确认受理：留在弹窗并展示错误，允许重试
      setPhase('error')
      return
    }
    // 受理成功：先尝试关闭标签页（在事件时序上尽早调用，成功率更高），
    // 若浏览器策略阻止脚本关窗，则用兜底画面告知 dsh 已退出。
    window.close()
    setTimeout(() => setScreen(true), 500)
  }, [])

  const onButtonClick = useCallback(() => {
    if (isConfirmSkipped()) {
      void runShutdown()
      return
    }
    setPhase('confirm')
  }, [runShutdown])

  const onConfirm = useCallback(
    (dontAskAgain: boolean) => {
      if (dontAskAgain) setConfirmSkipped(true)
      setPhase('idle')
      void runShutdown()
    },
    [runShutdown],
  )

  return (
    <>
      <button
        type="button"
        className={cls.btn}
        title={tr('header.tooltip')}
        aria-label={tr('header.tooltip')}
        onClick={onButtonClick}
      >
        <span>{tr('header.action')}</span>
        <CloseIcon />
      </button>
      {(phase === 'confirm' || phase === 'error') && (
        <ConfirmDialog
          t={tr}
          error={phase === 'error'}
          onCancel={() => setPhase('idle')}
          onConfirm={onConfirm}
        />
      )}
      {screen && <ShutdownScreen t={tr} />}
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
