"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import type { components } from "@/lib/types/api.types";

type CalculatorVersionDto = components["schemas"]["CalculatorVersionDto"];

interface VersionSelectorProps {
  versions: CalculatorVersionDto[];
  selectedVersionId: string;
  onChange: (versionId: string) => void;
}

export function VersionSelector({
  versions,
  selectedVersionId,
  onChange,
}: VersionSelectorProps) {
  const t = useTranslations("calculator.version");
  if (versions.length === 0) return null;
  const selectedVersionValue =
    versions.find((v) => v.id === selectedVersionId)?.version ?? null;

  return (
    <div className="space-y-1.5">
      <Label htmlFor="version-select">{t("label")}</Label>
      <Select
        value={selectedVersionValue}
        onValueChange={(versionValue) => {
          if (!versionValue) return;
          const version = versions.find((v) => v.version === versionValue);
          if (version?.id) onChange(version.id);
        }}
      >
        <SelectTrigger id="version-select" className="w-56">
          <SelectValue placeholder={t("placeholder")} />
        </SelectTrigger>
        <SelectContent>
          {versions.map((v) => (
            <SelectItem key={v.id} value={v.version!}>
              {t("item", { version: v.version ?? "" })}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
