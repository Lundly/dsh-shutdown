import { useState } from 'react'
import type { Translator } from './locales'
import { cls } from './styles'

export interface ConfirmDialogProps {
  t: Translator
  /** 上一次关闭请求被 Host 拒绝（非 2xx）时展示错误文案并允许重试 */
  error: boolean
  onCancel: () => void
  /** 确认关闭；参数为「不再显示提示」勾选状态 */
  onConfirm: (dontAskAgain: boolean) => void
}

/** 确认弹窗：自绘遮罩 + 卡片，不依赖 primitives 的 Modal，规避未知 API 面。 */
export function ConfirmDialog({ t, error, onCancel, onConfirm }: ConfirmDialogProps) {
  const [dontAsk, setDontAsk] = useState(false)

  return (
    <div className={cls.overlay} onClick={onCancel} role="presentation">
      <div
        className={cls.card}
        role="dialog"
        aria-modal="true"
        aria-label={t('dialog.title')}
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className={cls.cardTitle}>{t('dialog.title')}</h3>
        <p className={cls.cardDesc}>{t('dialog.description')}</p>
        {error && <p className={cls.cardError}>{t('dialog.error')}</p>}
        <label className={cls.checkRow}>
          <input
            type="checkbox"
            checked={dontAsk}
            onChange={(event) => setDontAsk(event.currentTarget.checked)}
          />
          <span>{t('dialog.dontAsk')}</span>
        </label>
        <div className={cls.footer}>
          <button type="button" className={cls.btnGhost} onClick={onCancel}>
            {t('dialog.cancel')}
          </button>
          <button
            type="button"
            className={`${cls.btnGhost} ${cls.btnPrimary}`}
            onClick={() => onConfirm(dontAsk)}
          >
            {t('dialog.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}
