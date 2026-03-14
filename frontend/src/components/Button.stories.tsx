import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus, Trash2, ArrowRight } from 'lucide-react';
import Button from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'danger', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'full'],
    },
    isLoading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// ── Basic variants ──────────────────────────────────────────
export const Primary: Story = {
  args: { variant: 'primary', children: 'Create Event' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'View Details' },
};

export const Outline: Story = {
  args: { variant: 'outline', children: 'Cancel' },
};

export const Danger: Story = {
  args: { variant: 'danger', children: 'Delete Event' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Clear chat' },
};

// ── Sizes ──────────────────────────────────────────────────
export const Small: Story = {
  args: { size: 'sm', children: 'Small' },
};

export const Large: Story = {
  args: { size: 'lg', children: 'Large Button' },
};

export const FullWidth: Story = {
  args: { size: 'full', children: 'Submit' },
};

// ── States ────────────────────────────────────────────────────
export const Loading: Story = {
  args: { isLoading: true, children: 'Saving...' },
};

export const Disabled: Story = {
  args: { disabled: true, children: 'Not Available' },
};

// ── With icons ───────────────────────────────────────────────
export const WithLeftIcon: Story = {
  args: {
    children: 'Create Event',
    leftIcon: <Plus className="h-4 w-4" />,
  },
};

export const WithRightIcon: Story = {
  args: {
    children: 'Next Step',
    rightIcon: <ArrowRight className="h-4 w-4" />,
  },
};

export const DangerWithIcon: Story = {
  args: {
    variant: 'danger',
    children: 'Delete',
    leftIcon: <Trash2 className="h-4 w-4" />,
  },
};