import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Sidebar } from "./Sidebar";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useEffect } from "react";

const SidebarWithUser = ({ role = "USER" }: { role?: "USER" | "ADMIN" }) => {
  const setUser = useAuthStore((s) => s.setUser);
  useEffect(() => {
    setUser({ id: "1", username: "john.doe", firstName: "John", lastName: "Doe", role } as never);
    return () => setUser(null);
  }, [role, setUser]);
  return <Sidebar />;
};

const meta: Meta = {
  title: "Shared/Sidebar",
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true, navigation: { pathname: "/dashboard" } },
  },
};
export default meta;
type Story = StoryObj;

export const UserRole: Story = { render: () => <SidebarWithUser role="USER" /> };
export const AdminRole: Story = { render: () => <SidebarWithUser role="ADMIN" /> };
export const NoUser: Story = { render: () => <Sidebar /> };
