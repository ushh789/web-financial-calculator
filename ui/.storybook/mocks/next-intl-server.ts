import { createTranslator } from "next-intl";
import enMessages from "../../src/messages/en.json";
import ukMessages from "../../src/messages/uk.json";

const messageMap: Record<string, Record<string, unknown>> = {
  en: enMessages as Record<string, unknown>,
  uk: ukMessages as Record<string, unknown>,
};

export const getTranslations = async (
  options: string | { namespace?: string; locale?: string }
) => {
  const namespace = typeof options === "string" ? options : (options.namespace ?? "");
  const locale = (typeof options === "object" && options.locale) ? options.locale : "en";
  return createTranslator({
    locale,
    messages: messageMap[locale] ?? messageMap.en,
    namespace,
  });
};
