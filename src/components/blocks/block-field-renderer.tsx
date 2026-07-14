"use client";
import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type FieldType =
  "text" | "number" | "checkbox" | "select" | "array" | "color" | "textarea";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
  fields?: FieldDef[];
}

interface BlockFieldRendererProps {
  field: FieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}

export function BlockFieldRenderer({
  field,
  value,
  onChange,
}: BlockFieldRendererProps) {
  const id = useId();

  switch (field.type) {
    case "text": {
      return (
        <div className="space-y-2">
          <Label htmlFor={id}>{field.label}</Label>
          <Input
            id={id}
            type="text"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
          />
        </div>
      );
    }
    case "number": {
      return (
        <div className="space-y-2">
          <Label htmlFor={id}>{field.label}</Label>
          <Input
            id={id}
            type="number"
            value={value as number}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        </div>
      );
    }
    case "checkbox": {
      return (
        <div className="flex items-center gap-2">
          <input
            id={id}
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            className="size-4 rounded border"
          />
          <Label htmlFor={id}>{field.label}</Label>
        </div>
      );
    }
    case "select": {
      return (
        <div className="space-y-2">
          <Label htmlFor={id}>{field.label}</Label>
          <select
            id={id}
            className="border-input h-8 w-full rounded-lg border bg-transparent px-2.5 py-1 text-sm"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          >
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );
    }
    case "textarea": {
      return (
        <div className="space-y-2">
          <Label htmlFor={id}>{field.label}</Label>
          <textarea
            id={id}
            className="border-input h-24 w-full rounded-lg border bg-transparent px-2.5 py-1 text-sm"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
    }
    default:
      return null;
  }
}
