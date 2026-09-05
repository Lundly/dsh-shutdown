/** 与 Host 半 src/index.ts 中的路由保持一致 */
export const EXIT_ROUTE = '/api/dsh-shutdown.exit'

function exitUrl(): string {
  // 与 session-log-export 的 client controller 同款兜底：IDE 内嵌等非标准 origin 时
  // 回退到 dsh 内部主机名
  const origin = globalThis.location?.origin ?? ''
  const base = origin && origin !== 'null' ? origin : 'http://dsh.internal'
  return new URL(EXIT_ROUTE, base).toString()
}

/**
 * 请求安全结束 dsh 进程，返回 Host 是否确认受理（2xx）。
 *
 * keepalive：确认后页面可能立刻关闭，保证请求在页面卸载后仍送达。
 * 请求本身发不出去（连接被拒）通常意味着服务已不可达——按已受理处理，
 * 由「dsh 已安全关闭」兜底画面接管展示。
 */
export async function requestAppExit(): Promise<boolean> {
  try {
    const response = await fetch(exitUrl(), {
      method: 'POST',
      keepalive: true,
      headers: { 'content-type': 'application/json' },
      body: '{}',
    })
    return response.ok
  } catch {
    return true
  }
}
