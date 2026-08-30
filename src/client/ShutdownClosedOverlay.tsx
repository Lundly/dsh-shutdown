import { createPortal } from 'react-dom'
import type { CSSProperties, ReactNode } from 'react'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import { NS } from './locales.ts'

const rootStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 2147483000,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,
  background: 'var(--dsw-alias-bg-base)',
  color: 'var(--dsw-alias-label-primary)',
  fontFamily: 'var(--dsw-font-family)',
  textAlign: 'center',
}

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 22,
  fontWeight: 600,
  lineHeight: '28px',
}

const descriptionStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: '20px',
  color: 'var(--dsw-alias-label-secondary)',
}

/**
 * Full-screen "dsh has shut down" overlay. Rendered once the shutdown was
 * triggered, in case the browser does not close the tab (a page dsh did not
 * script-open). Portaled to `document.body` so it covers the whole app.
 * @param props - localized copy.
 * @returns the overlay portal rooted at the page body.
 */
export function ShutdownClosedOverlay({ t }: PropsLocale<typeof NS>): ReactNode {
  return createPortal(
    <div style={rootStyle} role="status" aria-live="assertive" data-testid="dsh-shutdown-overlay">
      <h1 style={titleStyle}>{t('overlay.title')}</h1>
      <p style={descriptionStyle}>{t('overlay.description')}</p>
    </div>,
    document.body,
  )
}
