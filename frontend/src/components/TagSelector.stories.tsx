import type { Meta, StoryObj } from '@storybook/react-vite';
import TagSelector from './TagSelector';


const availableTags = [
  { id: 1, name: 'Tech', color: '#3b82f6' },
  { id: 2, name: 'Art', color: '#ef4444' },
  { id: 3, name: 'Business', color: '#10b981' },
  { id: 4, name: 'Music', color: '#8b5cf6' },
];

const meta: Meta<typeof TagSelector> = {
  title: 'Components/TagSelector',
  component: TagSelector,
  tags: ['autodocs'],
  args: {
    availableTags,
    selectedTagIds: [],
    onChange: (ids) => console.log('onChange:', ids),
    onTagCreated: (tag) => console.log('onTagCreated:', tag),
    maxTags: 5,
  },
};

export default meta;
type Story = StoryObj<typeof TagSelector>;

export const Default: Story = {
  args: { selectedTagIds: [] },
};

export const SomeSelected: Story = {
  args: { selectedTagIds: [1, 3] },
};

export const MaxTagsReached: Story = {
  args: { selectedTagIds: [1, 2, 3, 4], maxTags: 4 },
};

export const CustomMaxTags: Story = {
  args: { maxTags: 3 },
};
