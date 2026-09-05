import { useEffect, useState } from 'react'
import type { Translator } from './locales'
import { cls } from './styles'

export interface ShutdownScreenProps {
  t: Translator
}

/**
 * 关闭兜底画面：window.close() 未能关闭标签页时接管整页展示。
 * Host 侧从「回包 → dispose 完成」有最长数秒的收尾时间，先显示进行中再切换终态。
 */
export function ShutdownScreen({ t }: ShutdownScreenProps) {
  const [done, setDone] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDone(true), 2500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={cls.screen}>
      {done ? (
        <>
          <span className={cls.check} aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12.5l4.5 4.5L19 7.5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <p className={cls.screenTitle}>{t('screen.closed')}</p>
          <p className={cls.screenHint}>{t('screen.hint')}</p>
        </>
      ) : (
        <>
          <span className={cls.spinner} aria-hidden="true" />
          <p className={cls.screenTitle}>{t('screen.closing')}</p>
        </>
      )}
    </div>
  )
}
