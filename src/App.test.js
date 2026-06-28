import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the resume editor header', () => {
  render(<App />);
  expect(screen.getByText(/Easy Customize/i)).toBeInTheDocument();
});
