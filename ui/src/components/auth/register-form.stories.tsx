import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { http, HttpResponse } from "msw";
import { RegisterForm } from "./RegisterForm";

const meta: Meta<typeof RegisterForm> = {
  title: "Auth/RegisterForm",
  component: RegisterForm,
  parameters: {
    layout: "centered",
    nextjs: { appDirectory: true, navigation: { pathname: "/register" } },
  },
  decorators: [(Story) => <div className="w-80"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof RegisterForm>;

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post("/auth/register", () =>
          HttpResponse.json({ id: "2", username: "newuser", role: "USER" })
        ),
      ],
    },
  },
};

export const FilledAndSubmit: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post("/auth/register", () =>
          HttpResponse.json({ id: "2", username: "newuser", role: "USER" })
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Fill text fields: First name, Last name, Username, Email
    const fields = canvas.getAllByRole("textbox");
    for (const field of fields) {
      await userEvent.type(field, "testvalue");
    }
    // Fill password fields: Password and Confirm password
    const passwordFields =
      canvasElement.querySelectorAll<HTMLInputElement>('input[type="password"]');
    for (const f of passwordFields) {
      await userEvent.type(f, "Password1!");
    }
    await userEvent.click(canvas.getByRole("button", { name: /register/i }));
  },
};

export const ValidationErrors: Story = {
  parameters: { msw: { handlers: [] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /register/i }));
    await expect(canvas.getAllByRole("paragraph")[0]).toBeInTheDocument();
  },
};
