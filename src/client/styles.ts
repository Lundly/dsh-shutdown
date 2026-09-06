/**
 * 插件样式。以 JS 注入 <style> 的方式交付：
 * 不依赖打包器的 CSS module 产物形态，产物为纯 JS 工厂即可完整工作；
 * 类名统一使用 dsh-shutdown- 前缀避免与主界面/其他插件冲突。
 * 颜色优先使用 dsh 设计令牌（--dsw-*），并带中性回退值。
 */
const STYLE_ID = 'dsh-shutdown-styles'

const css = `
.dsh-shutdown-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 4px;
  min-width: 64px; height: 32px; padding: 6px 12px;
  border: 0.5px solid var(--dsw-alias-border-l4, rgba(0, 0, 0, 0.12));
  border-radius: 18px;
  color: var(--dsw-alias-label-primary, #1f2329);
  background: transparent;
  font-family: var(--dsw-font-family, inherit);
  font-size: 13px; font-weight: 400; line-height: 20px;
  cursor: pointer;
}
.dsh-shutdown-btn:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, 0.05));
}
.dsh-shutdown-overlay {
  position: fixed; inset: 0; z-index: 2147483000;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  font-family: var(--dsw-font-family, inherit);
}
.dsh-shutdown-card {
  width: 400px; max-width: calc(100vw - 48px); box-sizing: border-box;
  background: var(--dsw-alias-bg-primary, #fff);
  color: var(--dsw-alias-label-primary, #1f2329);
  border-radius: 12px; padding: 20px 24px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.24);
}
.dsh-shutdown-card-title { margin: 0 0 10px; font-size: 16px; font-weight: 600; line-height: 24px; }
.dsh-shutdown-card-desc { margin: 0 0 14px; font-size: 13px; line-height: 20px; color: var(--dsw-alias-label-secondary, #5b616b); }
.dsh-shutdown-card-error { margin: -4px 0 14px; font-size: 12px; line-height: 18px; color: #d03050; }
.dsh-shutdown-check-row {
  display: flex; align-items: center; gap: 8px; margin: 0 0 18px;
  font-size: 13px; line-height: 20px; cursor: pointer; user-select: none;
}
.dsh-shutdown-check-row input { width: 14px; height: 14px; margin: 0; cursor: pointer; accent-color: var(--dsw-alias-bg-brand, #4c6ef5); }
.dsh-shutdown-footer { display: flex; justify-content: flex-end; gap: 8px; }
.dsh-shutdown-btn-ghost {
  height: 32px; padding: 0 16px; border-radius: 8px;
  border: 0.5px solid var(--dsw-alias-border-l4, rgba(0, 0, 0, 0.12));
  background: transparent; color: inherit; font-family: inherit; font-size: 13px;
  cursor: pointer;
}
.dsh-shutdown-btn-ghost:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, 0.05)); }
.dsh-shutdown-btn-primary {
  background: var(--dsw-alias-label-primary, #1f2329);
  color: var(--dsw-alias-bg-primary, #fff);
  border-color: transparent;
}
.dsh-shutdown-btn-primary:hover { opacity: 0.9; background: var(--dsw-alias-label-primary, #1f2329); }
.dsh-shutdown-screen {
  position: fixed; inset: 0; z-index: 2147483600;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
  background: var(--dsw-alias-bg-primary, #fff);
  color: var(--dsw-alias-label-primary, #1f2329);
  font-family: var(--dsw-font-family, inherit);
  text-align: center;
}
.dsh-shutdown-spinner {
  width: 28px; height: 28px; border-radius: 50%;
  border: 2.5px solid var(--dsw-alias-border-l4, rgba(0, 0, 0, 0.15));
  border-top-color: var(--dsw-alias-label-primary, #1f2329);
  animation: dsh-shutdown-spin 0.8s linear infinite;
}
@keyframes dsh-shutdown-spin { to { transform: rotate(360deg); } }
.dsh-shutdown-check {
  width: 44px; height: 44px; border-radius: 50%;
  background: #22a06b; color: #fff;
  display: flex; align-items: center; justify-content: center;
}
.dsh-shutdown-screen-title { margin: 0; font-size: 20px; font-weight: 600; }
.dsh-shutdown-screen-hint { margin: 0; font-size: 13px; color: var(--dsw-alias-label-secondary, #5b616b); }
.dsh-shutdown-settings-row {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 12px 0;
  font-family: var(--dsw-font-family, inherit);
}
.dsh-shutdown-settings-row-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.dsh-shutdown-settings-title {
  margin: 0; font-size: 14px; line-height: 20px; font-weight: 400;
  color: var(--dsw-alias-label-primary, #1f2329);
}
.dsh-shutdown-settings-desc {
  margin: 0; font-size: 12px; line-height: 18px;
  color: var(--dsw-alias-label-tertiary, #8f959e);
}
.dsh-shutdown-settings-check {
  display: flex; align-items: center; justify-content: center;
  width: 40px; height: 40px;
  cursor: pointer;
}
.dsh-shutdown-settings-check input {
  flex-shrink: 0; width: 18px; height: 18px; margin: 2px 0 0; cursor: pointer;
  accent-color: var(--dsw-alias-bg-brand, #4c6ef5);
}
`;

export const cls = {
  btn: "dsh-shutdown-btn",
  overlay: "dsh-shutdown-overlay",
  card: "dsh-shutdown-card",
  cardTitle: "dsh-shutdown-card-title",
  cardDesc: "dsh-shutdown-card-desc",
  cardError: "dsh-shutdown-card-error",
  checkRow: "dsh-shutdown-check-row",
  footer: "dsh-shutdown-footer",
  btnGhost: "dsh-shutdown-btn-ghost",
  btnPrimary: "dsh-shutdown-btn-primary",
  screen: "dsh-shutdown-screen",
  spinner: "dsh-shutdown-spinner",
  check: "dsh-shutdown-check",
  screenTitle: "dsh-shutdown-screen-title",
  screenHint: "dsh-shutdown-screen-hint",
  settingsRow: "dsh-shutdown-settings-row",
  settingsRowText: "dsh-shutdown-settings-row-text",
  settingsCheck: "dsh-shutdown-settings-check",
  settingsTitle: "dsh-shutdown-settings-title",
  settingsDesc: "dsh-shutdown-settings-desc",
} as const;

export function injectStyles(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return
  const el = document.createElement('style')
  el.id = STYLE_ID
  el.setAttribute('data-plugin', 'dsh-shutdown')
  el.textContent = css
  document.head.appendChild(el)
}
