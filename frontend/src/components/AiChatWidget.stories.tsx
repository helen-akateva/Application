import type { Meta, StoryObj } from '@storybook/react-vite';
import AiChatWidget from './AiChatWidget';

// Note: This component uses Zustand stores. 
// In a real Storybook setup, you might need to wrap this in a provider 
// or mock the stores if they rely on API calls or complex state.

const meta: Meta<typeof AiChatWidget> = {
  title: 'Components/AiChatWidget',
  component: AiChatWidget,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof AiChatWidget>;

export const Default: Story = {
  render: () => (
    <div className="h-[600px] w-full bg-gray-100 relative overflow-hidden">
      <div className="p-8">
        <h1 className="text-2xl font-bold">AI Assistant Demo</h1>
        <p className="text-gray-600">Click the bot icon in the bottom right corner.</p>
      </div>
      <AiChatWidget />
    </div>
  ),
};
