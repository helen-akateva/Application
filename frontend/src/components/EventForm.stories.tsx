import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import EventForm from './EventForm';

const meta: Meta<typeof EventForm> = {
  title: 'Components/EventForm',
  component: EventForm,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="max-w-2xl mx-auto p-6">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof EventForm>;

const availableTags = [
  { id: 1, name: 'tech', color: '#3B82F6' },
  { id: 2, name: 'art', color: '#EC4899' },
  { id: 3, name: 'business', color: '#F59E0B' },
  { id: 4, name: 'music', color: '#8B5CF6' },
  { id: 5, name: 'sport', color: '#10B981' },
];

export const CreateEvent: Story = {
  args: {
    submitLabel: 'Create Event',
    isSubmitting: false,
    availableTags,
    onSubmit: (values) => console.log('Submit:', values),
    onCancel: () => console.log('Cancel'),
  },
};

export const EditEvent: Story = {
  args: {
    submitLabel: 'Save Changes',
    isSubmitting: false,
    availableTags,
    initialValues: {
      title: 'Morning Yoga in the Park',
      description: 'Join us for a relaxing morning yoga session.',
      date: '2026-04-15',
      time: '09:00',
      location: 'Central Park, New York',
      capacity: '20',
      visibility: 'public',
      tagIds: [1, 5],
    },
    onSubmit: (values) => console.log('Submit:', values),
    onCancel: () => console.log('Cancel'),
  },
};

export const Submitting: Story = {
  args: {
    submitLabel: 'Creating...',
    isSubmitting: true,
    availableTags,
    onSubmit: () => {},
    onCancel: () => {},
  },
};

export const WithError: Story = {
  args: {
    submitLabel: 'Create Event',
    isSubmitting: false,
    status: 'Something went wrong. Please try again.',
    availableTags,
    onSubmit: () => {},
    onCancel: () => {},
  },
};

export const NoTags: Story = {
  args: {
    submitLabel: 'Create Event',
    isSubmitting: false,
    availableTags: [],
    onSubmit: () => {},
    onCancel: () => {},
  },
};