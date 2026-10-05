import React from 'react';
import { AlertTriangle, RotateCw, LayoutDashboard, LogIn } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    } else {
      window.location.reload();
    }
  };

  handleGoDashboard = () => {
    window.location.href = '/dashboard';
  };

  handleGoLogin = () => {
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;
      const title = this.props.title || "Admin Dashboard couldn't be loaded";

      return (
        <div className="min-h-[70vh] flex items-center justify-center p-4 bg-neutral-50/60">
          <div className="max-w-md w-full bg-white rounded-3xl border border-neutral-200 p-8 card-shadow text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 text-primary mx-auto flex items-center justify-center shadow-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">
                {title}
              </h2>
              <p className="text-xs text-neutral-500 mt-2">
                An unexpected error occurred while rendering this view. Please try reloading or return to your account.
              </p>
            </div>

            {/* Error Message for development mode only */}
            {isDev && this.state.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-left text-xs font-mono text-red-800 overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleRetry}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <RotateCw className="w-4 h-4" />
                Retry
              </button>

              <button
                type="button"
                onClick={this.handleGoDashboard}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-neutral-100 text-neutral-700 text-xs font-bold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-1.5 active:scale-95"
              >
                <LayoutDashboard className="w-4 h-4" />
                Go to Dashboard
              </button>

              <button
                type="button"
                onClick={this.handleGoLogin}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-bold hover:bg-neutral-50 transition-colors flex items-center justify-center gap-1.5 active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                Go to Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
