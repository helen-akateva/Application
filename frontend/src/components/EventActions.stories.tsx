import type { Meta, StoryObj } from '@storybook/react-vite';
import EventActions from './EventActions';

const meta: Meta<typeof EventActions> = {
  title: 'Components/EventActions',
  component: EventActions,
  tags: ['autodocs'],
  args: {
    onEdit: () => console.log('onEdit'),
    onDelete: () => console.log('onDelete'),
    isLoading: false,
    isAuthenticated: true,
    isOrganizer: true,
  },
};

export default meta;
type Story = StoryObj<typeof EventActions>;

export const OrganizerActions: Story = {
  args: { isOrganizer: true, isAuthenticated: true },
};

export const Loading: Story = {
  args: { isOrganizer: true, isAuthenticated: true, isLoading: true },
};

export const NotOrganizer: Story = {
  args: { isOrganizer: false, isAuthenticated: true },
};

export const Unauthenticated: Story = {
  args: { isAuthenticated: false, isOrganizer: false },
};