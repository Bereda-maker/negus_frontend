'use client';

import { Component, ReactNode, ErrorInfo } from 'react';
import Button from '@/components/ui/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Client-side error boundary for isolated widgets (e.g. the chat panel or a
 * risky third-party embed) where you don't want the whole route to bail out
 * to app/error.tsx. For route-level crashes, Next's own error.tsx handles it.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <h1 className="text-2xl font-bold text-textPrimary">Something went wrong.</h1>
          <p className="mt-2 max-w-sm text-textSecondary">
            An unexpected error occurred. Try reloading the page.
          </p>
          <Button className="mt-6" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
