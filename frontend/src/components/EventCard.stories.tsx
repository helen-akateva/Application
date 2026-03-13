import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import EventCard from "./EventCard";

const meta: Meta<typeof EventCard> = {
  title: "Components/EventCard",
  component: EventCard,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="max-w-sm">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof EventCard>;

const baseEvent = {
  id: 1,
  title: "Morning Yoga in the Park",
  description: "Join us for a relaxing morning yoga session in the park.",
  date: "2026-04-15T09:00:00.000Z",
  location: "Central Park, New York",
  isPublic: true,
  capacity: 20,
  participantsCount: 12,
  visibility: "public" as const,
  organizer: { id: 2, email: "oksana@example.com", name: "Oksana Melnyk" },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  tags: [
    { id: 1, name: "Sport", color: "#10B981" },
    { id: 2, name: "Health", color: "#3B82F6" },
  ],
};

export const Default: Story = {
  args: {
    event: baseEvent,
    isJoined: false,
    isOrganizer: false,
    onJoinLeave: async () => {},
  },
};

export const Joined: Story = {
  args: {
    event: baseEvent,
    isJoined: true,
    isOrganizer: false,
    onJoinLeave: async () => {},
  },
};

export const OrganizerView: Story = {
  args: {
    event: baseEvent,
    isJoined: false,
    isOrganizer: true,
    onJoinLeave: async () => {},
  },
};

export const FullEvent: Story = {
  args: {
    event: { ...baseEvent, participantsCount: 20 },
    isJoined: false,
    isOrganizer: false,
    onJoinLeave: async () => {},
  },
};

export const NoCapacity: Story = {
  args: {
    event: { ...baseEvent, capacity: null, participantsCount: 5 },
    isJoined: false,
    isOrganizer: false,
    onJoinLeave: async () => {},
  },
};

export const NoTags: Story = {
  args: {
    event: { ...baseEvent, tags: [] },
    isJoined: false,
    isOrganizer: false,
    onJoinLeave: async () => {},
  },
};

export const LongTitle: Story = {
  args: {
    event: {
      ...baseEvent,
      title: "Contemporary Art Exhibition Opening Night with Special Guests",
    },
    isJoined: false,
    isOrganizer: false,
    onJoinLeave: async () => {},
  },
};
