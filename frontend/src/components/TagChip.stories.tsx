import type { Meta, StoryObj } from '@storybook/react-vite';
import { TagChip } from './TagChip';

const meta: Meta<typeof TagChip> = {
  title: 'Components/TagChip',
  component: TagChip,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TagChip>;

export const Tech: Story = {
  args: {
    tag: { id: 1, name: 'Tech', color: '#3B82F6' },
    size: 'sm',
  },
};

export const Art: Story = {
  args: {
    tag: { id: 2, name: 'Art', color: '#EC4899' },
  },
};

export const Music: Story = {
  args: {
    tag: { id: 3, name: 'Music', color: '#8B5CF6' },
  },
};

export const MediumSize: Story = {
  args: {
    tag: { id: 4, name: 'Business', color: '#F59E0B' },
    size: 'md',
  },
};

export const NoColor: Story = {
  args: {
    tag: { id: 5, name: 'General' },
  },
};

export const AllTags: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {[
        { id: 1, name: 'Tech', color: '#3B82F6' },
        { id: 2, name: 'Art', color: '#EC4899' },
        { id: 3, name: 'Business', color: '#F59E0B' },
        { id: 4, name: 'Music', color: '#8B5CF6' },
        { id: 5, name: 'Sport', color: '#10B981' },
        { id: 6, name: 'Food', color: '#EF4444' },
        { id: 7, name: 'Design', color: '#06B6D4' },
      ].map((tag) => (
        <TagChip key={tag.id} tag={tag} />
      ))}
    </div>
  ),
};