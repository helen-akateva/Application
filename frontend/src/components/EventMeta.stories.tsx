import type { Meta, StoryObj } from '@storybook/react-vite';
import type { EventDetails } from '../types';
import EventMeta from './EventMeta';

const mockEvent: EventDetails = {
  id: 1,
  title: 'Tech Conference 2025',
  description: 'A grand tech event.',
  date: '2025-05-20T18:00:00Z',
  location: 'San Francisco, CA',
  capacity: 100,
  visibility: 'public',
  organizer: {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: '2025-01-01',
  },
  participants: [
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', createdAt: '2025-01-02' },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', createdAt: '2025-01-03' },
  ],
  tags: [
    { id: 1, name: 'Tech', color: '#3b82f6' },
    { id: 2, name: 'Future', color: '#8b5cf6' },
  ],
  createdAt: '2025-01-01',
  updatedAt: '2025-01-01',
};

const meta: Meta<typeof EventMeta> = {
  title: 'Components/EventMeta',
  component: EventMeta,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EventMeta>;

export const Default: Story = {
  args: { event: mockEvent },
};

export const UnlimitedCapacity: Story = {
  args: {
    event: { ...mockEvent, capacity: null },
  },
};

export const ManyParticipants: Story = {
  args: {
    event: {
      ...mockEvent,
      participants: Array.from({ length: 50 }, (_, i) => ({
        id: i + 10,
        name: `Participant ${i + 1}`,
        email: `participant${i + 1}@example.com`,
        createdAt: '2025-01-01',
      })),
    },
  },
};