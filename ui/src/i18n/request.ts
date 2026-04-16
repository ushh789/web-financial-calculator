import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

const SUPPORTED = ["uk", "en"] as const;
type Locale = (typeof SUPPORTED)[number];

const messageLoaders: Record<Locale, () => Promise<{ default: unknown }>> = {
  uk: () => import("../messages/uk.json"),
  en: () => import("../messages/en.json"),
};

function isSupportedLocale(v: unknown): v is Locale {
  return SUPPORTED.includes(v as Locale);
}

export default getRequestConfig(async ({ requestLocale }) => {
  const fromRouter = await requestLocale;
  const fromCookie = (await cookies()).get("NEXT_LOCALE")?.value;
  const raw = fromCookie ?? fromRouter ?? "uk";
  const locale: Locale = isSupportedLocale(raw) ? raw : "uk";

  return {
    locale,
    messages: (await messageLoaders[locale]()).default as Record<string, unknown>,
  };
});
