import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * 隔离插件组件的渲染错误：出错时渲染 null（本插件功能缺席），
 * 避免异常冒泡影响 dsh 主界面其他部分。
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error): void {
    console.error('[dsh-shutdown] render error:', error)
  }

  render(): ReactNode {
    if (this.state.error) return null
    return this.props.children
  }
}
