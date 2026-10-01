import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('React ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem', maxWidth: 600, margin: '4rem auto',
          fontFamily: 'monospace', background: '#fee2e2',
          border: '1px solid #ef4444', borderRadius: 8
        }}>
          <h2 style={{ color: '#991b1b', marginBottom: '1rem' }}>
            ⚠️ Something went wrong
          </h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '.85rem', color: '#7f1d1d' }}>
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.href = '/login'}
            style={{ marginTop: '1rem', padding: '.5rem 1rem', cursor: 'pointer' }}
          >
            Go to Login
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
