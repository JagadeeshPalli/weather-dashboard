import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-card text-center py-10 mt-4">
          <p className="font-sans text-dim text-sm">
            Something went wrong. Please refresh the page.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 font-code text-xs text-[#3B82F6] hover:underline"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
