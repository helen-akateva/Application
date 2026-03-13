import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Navbar from "./Navbar";

const meta: Meta<typeof Navbar> = {
  title: "Components/Navbar",
  component: Navbar,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Navbar>;

// Helper щоб встановити стан стору перед рендером
const withAuth = (Story: React.ComponentType) => {
  useAuthStore.setState({
    isAuthenticated: true,
    user: { id: 1, email: "oksana@example.com", name: "Oksana Melnyk" },
  });
  return <Story />;
};

const withoutAuth = (Story: React.ComponentType) => {
  useAuthStore.setState({
    isAuthenticated: false,
    user: null,
  });
  return <Story />;
};

export const LoggedIn: Story = {
  decorators: [withAuth],
};

export const LoggedOut: Story = {
  decorators: [withoutAuth],
};

export const LoggedInLongName: Story = {
  decorators: [
    (Story) => {
      useAuthStore.setState({
        isAuthenticated: true,
        user: { id: 1, email: "test@example.com", name: "Oleksandr Kovalenko" },
      });
      return <Story />;
    },
  ],
};
