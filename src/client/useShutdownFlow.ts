import { useCallback, useState } from 'react'
import { requestAppExit } from './shutdown'
import { isConfirmSkipped, setConfirmSkipped } from './storage'

type Phase = 'idle' | 'confirm' | 'error'

/**
 * 关闭流程的共享状态机：点击 → 确认弹窗（可跳过）→ 请求退出 → 兜底画面。
 * 顶栏按钮（普通会话）与浮层按钮（新建会话 hero 相位）两个注册点共用，
 * 确保弹窗、偏好与退出行为完全一致。
 */
export function useShutdownFlow() {
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

  const open = useCallback(() => {
    if (isConfirmSkipped()) {
      void runShutdown()
      return
    }
    setPhase('confirm')
  }, [runShutdown])

  const cancel = useCallback(() => setPhase('idle'), [])

  const confirm = useCallback(
    (dontAskAgain: boolean) => {
      if (dontAskAgain) setConfirmSkipped(true)
      setPhase('idle')
      void runShutdown()
    },
    [runShutdown],
  )

  return { phase, screen, open, cancel, confirm }
}
