import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input } from "./input";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = { args: { placeholder: "Enter text…" } };
export const WithValue: Story = { args: { defaultValue: "Hello World" } };
export const Disabled: Story = { args: { placeholder: "Disabled", disabled: true } };
export const NumberType: Story = { args: { type: "number", placeholder: "0.00" } };
export const PasswordType: Story = { args: { type: "password", placeholder: "Password" } };
export const Invalid: Story = { args: { "aria-invalid": true, placeholder: "Invalid input" } };
