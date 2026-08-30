/**
 * Browser plugin owning the dsh-shutdown UI: the Session Header close button,
 * its confirmation dialog, the persistent "don't ask again" preference, the
 * General-settings re-enable row, and the shut-down overlay.
 * @module dsh-shutdown/client
 */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { ShutdownDialogInjected } from './HeaderAction.tsx'
import { ShutdownHeaderAction } from './HeaderAction.tsx'
import { ShutdownSettingsRow } from './ShutdownSettingsRow.tsx'
import { ShutdownPrefsController } from './ShutdownPrefsController.ts'
import { en, NS, zh, type ShutdownLocaleKey } from './locales.ts'
import { requestShutdown } from './requestShutdown.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    'dsh-shutdown': ShutdownLocaleKey
  }
}

/** Services required before the browser plugin can mount. */
export const inject = ['slots', 'locale']

/**
 * Mount the header action, settings row, and their shared shutdown state.
 * @param ctx - browser context carrying the slots and locale services.
 */
export function apply(ctx: ClientContext): void {
  const controller = new ShutdownPrefsController()
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-shutdown: dictionaries')

  const beginShutdown = (): void => {
    controller.markClosed()
    requestShutdown()
  }
  const injected = (): ShutdownDialogInjected => ({
    hooks: { shutdownPrefs: controller.store },
    setConfirmDisabled: (value: boolean) => { controller.setConfirmDisabled(value) },
    beginShutdown,
  })

  ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({
    name: 'conversation.session.header.utilities',
    id: 'shutdown',
    locale: NS,
    inject: injected,
  }, ShutdownHeaderAction))

  ctx.slots.inject('settings.general.item', () => ctx.slots.register({
    name: 'settings.general.item',
    id: 'shutdown-confirm',
    order: -10,
    locale: NS,
    inject: injected,
  }, ShutdownSettingsRow))
}
