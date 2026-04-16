import { getTranslations } from "next-intl/server";
import { AuthHeroContent } from "@/components/auth/AuthHeroContent";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("auth");

  return (
    <div className="min-h-screen flex">
      {/* Left hero panel — 75% width, hidden below lg breakpoint */}
      <section
        className="hidden lg:flex lg:w-3/4 relative overflow-hidden p-12 flex-col"
        style={{
          background: `linear-gradient(145deg,
            var(--hero-gradient-start) 0%,
            var(--hero-gradient-mid) 50%,
            var(--hero-gradient-end) 100%)`,
        }}
      >
        {/* Decorative background blobs */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white opacity-[0.06] blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-white opacity-[0.04] blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white opacity-[0.02] blur-[120px] pointer-events-none" />

        <AuthHeroContent
          headline={t("hero.headline")}
          subheadline={t("hero.subheadline")}
          features={[
            t("hero.feature1"),
            t("hero.feature2"),
            t("hero.feature3"),
            t("hero.feature4"),
          ]}
        />
      </section>

      {/* Divider — gradient glow line */}
      <div
        className="hidden lg:block w-px shrink-0 self-stretch"
        style={{
          background: `linear-gradient(
            to bottom,
            transparent 0%,
            oklch(0.55 0.22 264 / 0.4) 20%,
            oklch(0.65 0.22 264 / 0.8) 50%,
            oklch(0.55 0.22 264 / 0.4) 80%,
            transparent 100%
          )`,
          boxShadow: `0 0 8px 1px oklch(0.55 0.22 264 / 0.3)`,
        }}
      />

      {/* Right form panel — 25% (full width on mobile) */}
      <section className="lg:w-1/4 w-full flex flex-col items-center justify-center p-6 overflow-y-auto bg-background">
        {children}
      </section>
    </div>
  );
}
