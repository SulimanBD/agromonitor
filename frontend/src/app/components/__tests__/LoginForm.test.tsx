import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from '../LoginForm';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks();

  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: {
      setItem: jest.fn(),
      getItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });

  // Mock router
  useRouter.mockReturnValue({
    push: jest.fn(),
  });

  // Mock fetch
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        access: 'access',
        refresh: 'refresh',
      }),
    })
  ) as jest.Mock;
});

test('redirects to home page on successful login and stores tokens', async () => {
  render(<LoginForm />);

  fireEvent.change(screen.getByPlaceholderText('Username'), {
    target: { value: 'validuser' },
  });

  fireEvent.change(screen.getByPlaceholderText('Password'), {
    target: { value: 'validpassword' },
  });

  fireEvent.click(screen.getByText('Login'));

  await waitFor(() => {
    expect(localStorage.setItem).toHaveBeenCalledWith('access_token', 'access');
    expect(localStorage.setItem).toHaveBeenCalledWith('refresh_token', 'refresh');
  });

  expect(useRouter().push).toHaveBeenCalledWith('/');
});

test('displays error message on failed login', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });
  
    render(<LoginForm />);
  
    fireEvent.change(screen.getByPlaceholderText('Username'), {
      target: { value: 'wronguser' },
    });
  
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'wrongpassword' },
    });
  
    fireEvent.click(screen.getByText('Login'));
  
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
  
