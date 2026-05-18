import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { http, HttpResponse } from "msw";
import { LoginForm } from "./LoginForm";

const meta: Meta<typeof LoginForm> = {
  title: "Auth/LoginForm",
  component: LoginForm,
  parameters: {
    layout: "centered",
    nextjs: { appDirectory: true, navigation: { pathname: "/login" } },
  },
  decorators: [(Story) => <div className="w-80"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof LoginForm>;

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post("/auth/login", () =>
          HttpResponse.json({ id: "1", username: "john", role: "USER" })
        ),
      ],
    },
  },
};

export const FilledAndSubmit: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post("/auth/login", () =>
          HttpResponse.json({ id: "1", username: "john", role: "USER" })
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText(/username/i), "john.doe");
    await userEvent.type(canvas.getByLabelText(/password/i), "secret123");
    await userEvent.click(canvas.getByRole("button", { name: /sign in/i }));
  },
};

export const ValidationErrors: Story = {
  parameters: {
    msw: { handlers: [] },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /sign in/i }));
    await expect(canvas.getAllByRole("paragraph")[0]).toBeInTheDocument();
  },
};

export const ServerError: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post("/auth/login", () =>
          HttpResponse.json({ message: "Invalid credentials" }, { status: 401 })
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText(/username/i), "wrong");
    await userEvent.type(canvas.getByLabelText(/password/i), "wrong");
    await userEvent.click(canvas.getByRole("button", { name: /sign in/i }));
  },
};
