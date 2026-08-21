import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '../components/ErrorBoundary';

function GoodChild() {
  return <div data-testid="child">Working</div>;
}

function BadChild(): React.ReactElement {
  throw new Error('Kaboom!');
}

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary label="Test">
        <GoodChild />
      </ErrorBoundary>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('shows fallback UI when child throws', () => {
    // Suppress console.error from React's error reporting
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary label="TestSection">
        <BadChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('TestSection crashed')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    spy.mockRestore();
  });

  it('displays the error message in the fallback', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary label="Boom">
        <BadChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Kaboom!')).toBeInTheDocument();
    spy.mockRestore();
  });

  it('recovers when Try Again is clicked', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    let shouldThrow = true;

    function ToggleChild() {
      if (shouldThrow) throw new Error('Toggle error');
      return <div data-testid="recovered">Recovered</div>;
    }

    render(
      <ErrorBoundary label="Toggle">
        <ToggleChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Toggle crashed')).toBeInTheDocument();

    // Fix the condition so next render succeeds
    shouldThrow = false;

    // Click "Try Again"
    await userEvent.click(screen.getByText('Try Again'));

    expect(screen.getByTestId('recovered')).toBeInTheDocument();
    spy.mockRestore();
  });
});