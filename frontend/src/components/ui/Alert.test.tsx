import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Alert from './Alert';

describe('Alert', () => {
  it('renders its children', () => {
    render(<Alert>Something went wrong</Alert>);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('exposes role="alert" so screen readers announce it', () => {
    render(<Alert variant="danger">Failed to save</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('applies variant-specific styling', () => {
    render(<Alert variant="success">Saved</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('bg-green-50');
  });

  it('defaults to the info variant when none is given', () => {
    render(<Alert>Heads up</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('bg-blue-50');
  });
});
