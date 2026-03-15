import type { Meta, StoryObj } from '@storybook/react-vite';
import EventActions from './EventActions';

const meta: Meta<typeof EventActions> = {
  title: 'Components/EventActions',
  component: EventActions,
  tags: ['autodocs'],
  args: {
    onJoinLeave: () => console.log('onJoinLeave'),
    onEdit: () => console.log('onEdit'),
    onDelete: () => console.log('onDelete'),
    isLoading: false,
    isAuthenticated: true,
  },
};

export default meta;
type Story = StoryObj<typeof EventActions>;

export const JoinEvent: Story = {
  args: { isJoined: false, isOrganizer: false },
};

export const LeaveEvent: Story = {
  args: { isJoined: true, isOrganizer: false },
};

export const OrganizerActions: Story = {
  args: { isJoined: false, isOrganizer: true },
};

export const Loading: Story = {
  args: { isJoined: false, isOrganizer: false, isLoading: true },
};

export const Unauthenticated: Story = {
  args: { isAuthenticated: false },
};