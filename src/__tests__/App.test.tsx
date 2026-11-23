import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';

// ---------------------------------------------------------------------------
// F4: show an empty state when no rooms match
// ---------------------------------------------------------------------------
describe('F4 — empty state when no rooms match', () => {
  it('shows the empty-state message when attendee count exceeds all room capacities', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Set attendees to 100 — no room has capacity that high
    const attendeesInput = screen.getByLabelText(/Attendees/i);
    await user.clear(attendeesInput);
    await user.type(attendeesInput, '100');

    expect(screen.getByText('No rooms match your filters.')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// F5: changing the selected room clears the previous availability result
// ---------------------------------------------------------------------------
describe('F5 — changing room clears result', () => {
  it('clears the availability result when a different room is selected', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Select first matching room (B204 with default attendees=1)
    const b204Button = screen.getByText('Room B204');
    await user.click(b204Button);

    // Fill valid time and check availability
    const startInput = screen.getByLabelText(/Start time/i);
    const endInput = screen.getByLabelText(/End time/i);
    await user.clear(startInput);
    await user.type(startInput, '660');
    await user.clear(endInput);
    await user.type(endInput, '720');

    const checkButton = screen.getByRole('button', { name: 'Check Availability' });
    await user.click(checkButton);

    // Result should be visible (Available)
    expect(screen.getByText('Available')).toBeInTheDocument();

    // Now select a different room (A110)
    const a110Button = screen.getByText('Room A110');
    await user.click(a110Button);

    // The "Available" result should be gone
    expect(screen.queryByText('Available')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// F3: a blocked room is always unavailable in the UI
// ---------------------------------------------------------------------------
describe('F3 — blocked room D005 is always unavailable', () => {
  it('shows Unavailable with a blocked-room reason when D005 is checked', async () => {
    const user = userEvent.setup();
    render(<App />);

    // D005 has capacity 12, so with default attendees=1 it appears in the list
    await user.click(screen.getByText('Room D005'));

    // Enter a valid time window (660–720 is after NOW=540 and within 120 min)
    const startInput = screen.getByLabelText(/Start time/i);
    const endInput = screen.getByLabelText(/End time/i);
    await user.clear(startInput);
    await user.type(startInput, '660');
    await user.clear(endInput);
    await user.type(endInput, '720');

    await user.click(screen.getByRole('button', { name: 'Check Availability' }));

    // F3: a blocked room can never be reported as available
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
    expect(
      screen.getByText(/This room is currently blocked/i)
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Integration test: full availability check flow
// ---------------------------------------------------------------------------
describe('Integration — check availability end to end', () => {
  it('reports Available for a free slot on B204 and Unavailable for an overlapping slot', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Select B204
    await user.click(screen.getByText('Room B204'));

    // Check a free slot: 660–720 (after the 600–660 booking, touching at 660)
    const startInput = screen.getByLabelText(/Start time/i);
    const endInput = screen.getByLabelText(/End time/i);
    await user.clear(startInput);
    await user.type(startInput, '660');
    await user.clear(endInput);
    await user.type(endInput, '720');

    await user.click(screen.getByRole('button', { name: 'Check Availability' }));
    expect(screen.getByText('Available')).toBeInTheDocument();

    // Now change to an overlapping slot: 630–690 (overlaps 600–660)
    await user.clear(startInput);
    await user.type(startInput, '630');
    await user.clear(endInput);
    await user.type(endInput, '690');

    await user.click(screen.getByRole('button', { name: 'Check Availability' }));
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
  });

  it('shows validation errors for invalid time inputs', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Room B204'));

    // Enter start >= end
    const startInput = screen.getByLabelText(/Start time/i);
    const endInput = screen.getByLabelText(/End time/i);
    await user.clear(startInput);
    await user.type(startInput, '700');
    await user.clear(endInput);
    await user.type(endInput, '700');

    await user.click(screen.getByRole('button', { name: 'Check Availability' }));
    expect(screen.getByText('Please fix the following:')).toBeInTheDocument();
  });
});
