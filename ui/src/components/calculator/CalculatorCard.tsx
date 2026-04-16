import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { TrendingUp } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { components } from "@/lib/types/api.types";

type CalculatorDto = components["schemas"]["CalculatorDto"];

interface CalculatorCardProps {
  calculator: CalculatorDto;
}

export async function CalculatorCard({ calculator }: CalculatorCardProps) {
  const t = await getTranslations("calculator");

  return (
    <Card className="flex flex-col h-full transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
            <CardTitle className="text-base">{calculator.name}</CardTitle>
          </div>
          {calculator.active ? (
            <Badge variant="default">{t("active")}</Badge>
          ) : (
            <Badge variant="outline">{t("inactive")}</Badge>
          )}
        </div>
        {calculator.description && (
          <CardDescription>{calculator.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-xs text-muted-foreground font-mono">{calculator.code}</p>
      </CardContent>

      <CardFooter>
        {calculator.active ? (
          <Link
            href={`/calculators/${calculator.id}`}
            className={cn(buttonVariants({ size: "sm" }), "w-full text-center")}
          >
            {t("open")}
          </Link>
        ) : (
          <span
            className={cn(
              buttonVariants({ size: "sm" }),
              "w-full text-center opacity-50 pointer-events-none",
            )}
          >
            {t("open")}
          </span>
        )}
      </CardFooter>
    </Card>
  );
}
