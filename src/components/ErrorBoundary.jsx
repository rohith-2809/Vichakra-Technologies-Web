import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="text-center max-w-md">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} className="text-red-500" />
            </div>
            <h1 className="text-lg font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-sm text-gray-500 mb-6">
              An unexpected error occurred. Please refresh the page or contact support if the issue persists.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
