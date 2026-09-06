import type { UseSessions, SessionsStateLike } from '../types'
import { CloseIcon } from './HeaderAction'
import { ConfirmDialog } from './ConfirmDialog'
import { ErrorBoundary } from './ErrorBoundary'
import { composeT, detectLocale, type Translator } from './locales'
import { ShutdownScreen } from './ShutdownScreen'
import { cls } from './styles'
import { useShutdownFlow } from './useShutdownFlow'

export interface HeroActionProps {
  t?: Translator
  /** shell.overlay（root scope）槽位注入的标准 props：会话列表状态选择器 */
  useSessions?: UseSessions
  [key: string]: unknown
}

/**
 * hero 相位判定：与宿主 ConversationRoot 的 summaryBlank 同源——没有当前会话，
 * 或当前会话仍是未产生回合的新会话（blank）。此时宿主隐藏会话头部（含顶栏
 * utilities 槽位），需要浮层按钮补位。shellPhase 的精细相位（engaging/active）
 * 在 root scope 不可得，以此近似已覆盖「新建会话界面」的全部形态。
 */
function selectHeroPhase(state: SessionsStateLike): boolean {
  const current = state.current
  if (current === undefined) return true
  return state.byId?.[current]?.blank === true
}

function HeroActionInner(props: HeroActionProps) {
  const tr = composeT(props.t, detectLocale())
  const flow = useShutdownFlow()
  const { useSessions } = props
  // 选择器 hook 契约要求无条件调用；服务缺席时保守隐藏，
  // 避免在普通会话视图与顶栏按钮重叠。
  const hero = useSessions ? useSessions(selectHeroPhase) : false

  if (!hero) return null

  return (
    <>
      <div className={cls.heroAnchor}>
        <button
          type="button"
          className={cls.heroBtn}
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

/**
 * 浮层「关闭 dsh」按钮：注册在 shell.overlay 槽位（全局浮层，绝对定位于界面
 * 右上角）。仅 hero（新建会话）相位渲染；普通会话相位返回 null，由顶栏按钮负责。
 */
export function ShutdownHeroAction(props: HeroActionProps) {
  return (
    <ErrorBoundary>
      <HeroActionInner {...props} />
    </ErrorBoundary>
  )
}
