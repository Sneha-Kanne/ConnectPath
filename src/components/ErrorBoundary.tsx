import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };
  private readonly children: ReactNode;

  public constructor(props: ErrorBoundaryProps) {
    super(props);
    this.children = props.children;
  }

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ConnectPath crashed:', error, errorInfo);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen flex items-center justify-center bg-obsidian px-6 text-center text-white">
          <section className="w-full max-w-md rounded-2xl border border-cyan-glow/20 bg-white/[0.04] p-8 shadow-2xl">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-coral-glow/40 bg-coral-glow/10 text-2xl text-coral-glow">
              !
            </div>
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="mt-3 text-sm leading-6 text-muted-slate">
              ConnectPath hit an unexpected error. Reload the app to restore your journey.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-6 rounded-lg bg-cyan-glow px-5 py-2.5 text-sm font-bold text-obsidian transition hover:brightness-110"
            >
              Reload App
            </button>
          </section>
        </main>
      );
    }

    return this.children;
  }
}