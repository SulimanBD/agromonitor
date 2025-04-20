import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeviceList from '../DeviceList';
import { useRouter } from 'next/navigation';

// ✅ Mock the Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// ✅ Mock next/link to prevent navigation errors
jest.mock('next/link', () => {
    return ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  });
  

const mockDevices = [
  { device_id: 'abc123', location: 'Greenhouse', status: 'active' },
  { device_id: 'xyz456', location: 'Indoor', status: 'inactive' },
];

describe('DeviceList Component', () => {
  it('renders a list of devices', () => {
    render(<DeviceList devices={mockDevices} />);

    expect(screen.getByText(/ID: abc123/i)).toBeInTheDocument();
    expect(screen.getByText(/Location: Greenhouse/i)).toBeInTheDocument();
    expect(screen.getByText(/Status: active/i)).toBeInTheDocument();

    expect(screen.getByText(/ID: xyz456/i)).toBeInTheDocument();
    expect(screen.getByText(/Location: Indoor/i)).toBeInTheDocument();
    expect(screen.getByText(/Status: inactive/i)).toBeInTheDocument();
  });

  it('renders a navigation button to chart page', async () => {
    const pushMock = jest.fn(); // Mock the `push` function
    const useRouterMock = require('next/navigation').useRouter;
    useRouterMock.mockReturnValue({
      push: pushMock,
    });

    const user = userEvent.setup();
    render(<DeviceList devices={mockDevices} />);

    const button = screen.getByRole('button', { name: /view device comparison charts/i });
    await user.click(button);

    expect(pushMock).toHaveBeenCalledWith('/devices/chart');
  });

  it('renders message if no devices are passed', () => {
    render(<DeviceList devices={null as any} />);
    expect(screen.getByText(/no devices found/i)).toBeInTheDocument();
  });
});
