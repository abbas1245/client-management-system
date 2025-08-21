import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatBot from './ChatBot.jsx';

jest.mock('../../lib/axios', () => ({
  __esModule: true,
  default: { post: jest.fn().mockResolvedValue({ data: { reply: 'hello back' } }) },
}));

describe('ChatBot', () => {
  it('renders and sends a message', async () => {
    render(<ChatBot />);
    fireEvent.click(screen.getByRole('button'));
    const textarea = screen.getByPlaceholderText(/ask about clients/i);
    fireEvent.change(textarea, { target: { value: 'hello' } });
    fireEvent.keyDown(textarea, { key: 'Enter' });
    await waitFor(() => expect(screen.getByText('hello back')).toBeInTheDocument());
  });
});


