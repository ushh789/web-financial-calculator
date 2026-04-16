"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
  if (versions.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <Label htmlFor="version-select">Версія калькулятора</Label>
      <Select
        value={selectedVersionId}
        onValueChange={(val) => val && onChange(val as string)}
      >
        <SelectTrigger id="version-select" className="w-56">
          <SelectValue placeholder="Оберіть версію" />
        </SelectTrigger>
        <SelectContent>
          {versions.map((v) => (
            <SelectItem key={v.id} value={v.id!}>
              Версія {v.version}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
