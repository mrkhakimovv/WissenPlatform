import React, { Component, ErrorInfo, ReactNode } from 'react';
import { EmptyState } from './ui/EmptyState';
import { Button } from './ui/Button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0a]">
          <EmptyState
            icon="⚠️"
            title="Xatolik yuz berdi"
            description="Kechirasiz, kutilmagan xatolik yuz berdi. Iltimos, sahifani yangilang."
            action={
              <Button onClick={this.handleReload} variant="primary" className="mt-4">
                Sahifani yangilash
              </Button>
            }
          />
        </div>
      );
    }

    return (this.props as any).children;
  }
}
