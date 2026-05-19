import React from "react";
import type { Preview, Decorator } from "@storybook/nextjs-vite";
import { ThemeProvider } from "next-themes";
import { NextIntlClientProvider } from "next-intl";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initialize, mswLoader } from "msw-storybook-addon";
import "../src/app/globals.css";

import enMessages from "../src/messages/en.json";
import ukMessages from "../src/messages/uk.json";

initialize({ onUnhandledRequest: "bypass" });

const messages: Record<string, Record<string, unknown>> = {
  en: enMessages as Record<string, unknown>,
  uk: ukMessages as Record<string, unknown>,
};

const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme ?? "light";
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={theme}
      forcedTheme={theme === "system" ? undefined : theme}
    >
      <Story />
    </ThemeProvider>
  );
};

const withLocale: Decorator = (Story, context) => {
  const locale = (context.globals.locale as string) ?? "en";
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages[locale] ?? messages.en}
    >
      <Story />
    </NextIntlClientProvider>
  );
};

const withQueryClient: Decorator = (Story) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <Story />
    </QueryClientProvider>
  );
};

const preview: Preview = {
  globalTypes: {
    theme: {
      name: "Theme",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
          { value: "system", title: "System" },
        ],
        dynamicTitle: true,
      },
    },
    locale: {
      name: "Locale",
      toolbar: {
        icon: "globe",
        items: [
          { value: "en", title: "🇬🇧 EN" },
          { value: "uk", title: "🇺🇦 UA" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
    locale: "en",
  },
  decorators: [withTheme, withLocale, withQueryClient],
  loaders: [mswLoader],
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "error",
    },
  },
};

export default preview;
