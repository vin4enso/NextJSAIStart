"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { BlockFieldRenderer, type FieldDef } from "./block-field-renderer";
import { BlockTypeEnum, type BlockType } from "@/schemas/page-block";

const schemas: Record<string, z.ZodObject<z.ZodRawShape>> = {
  section: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
  }),
  heading: z.object({
    text: z.string().min(1, "Required"),
    level: z.number().optional(),
    alignment: z.enum(["left", "center", "right"]).optional(),
  }),
  paragraph: z.object({
    html: z.string().min(1, "Required"),
    alignment: z.enum(["left", "center", "right"]).optional(),
  }),
  image: z.object({
    src: z.string().min(1, "Required"),
    alt: z.string().min(1, "Required"),
    caption: z.string().optional(),
    sizing: z.enum(["cover", "contain", "fill"]).optional(),
  }),
  cta: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    buttonText: z.string().min(1, "Required"),
    buttonUrl: z.string().min(1, "Required"),
    buttonVariant: z.enum(["primary", "secondary", "outline"]).optional(),
  }),
  columns: z.object({
    columnsCount: z.number().min(1).max(4).optional(),
  }),
  column: z.object({
    width: z.number().min(1).optional(),
  }),
  faq: z.object({
    items: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
  }),
  divider: z.object({
    style: z.enum(["solid", "dashed", "dotted"]).optional(),
    color: z.string().optional(),
    thickness: z.number().min(1).optional(),
  }),
  video: z.object({
    url: z.string().min(1, "Required"),
    autoplay: z.boolean().optional(),
    controls: z.boolean().optional(),
  }),
  gallery: z.object({
    images: z.array(z.object({ src: z.string(), alt: z.string() })).optional(),
    layout: z.enum(["grid", "masonry", "carousel"]).optional(),
  }),
  pricing: z.object({
    plans: z
      .array(
        z.object({
          name: z.string(),
          price: z.number(),
          currency: z.string().optional(),
          period: z.string().optional(),
          features: z.array(z.string()).optional(),
          cta: z.object({ text: z.string(), url: z.string() }).optional(),
        }),
      )
      .optional(),
  }),
  form: z.object({
    fields: z
      .array(
        z.object({
          type: z.enum(["text", "email", "textarea", "select", "checkbox"]),
          label: z.string(),
          placeholder: z.string().optional(),
          required: z.boolean().optional(),
          options: z.array(z.string()).optional(),
        }),
      )
      .optional(),
    submitLabel: z.string().optional(),
  }),
};

const fieldsMap: Record<string, FieldDef[]> = {
  section: [
    { name: "title", label: "title", type: "text" },
    { name: "subtitle", label: "subtitle", type: "text" },
  ],
  heading: [
    { name: "text", label: "text", type: "text", required: true },
    { name: "level", label: "level", type: "number" },
    {
      name: "alignment",
      label: "alignment",
      type: "select",
      options: [
        { label: "left", value: "left" },
        { label: "center", value: "center" },
        { label: "right", value: "right" },
      ],
    },
  ],
  paragraph: [
    { name: "html", label: "html", type: "textarea", required: true },
    {
      name: "alignment",
      label: "alignment",
      type: "select",
      options: [
        { label: "left", value: "left" },
        { label: "center", value: "center" },
        { label: "right", value: "right" },
      ],
    },
  ],
  image: [
    { name: "src", label: "src", type: "text", required: true },
    { name: "alt", label: "alt", type: "text", required: true },
    { name: "caption", label: "caption", type: "text" },
    {
      name: "sizing",
      label: "sizing",
      type: "select",
      options: [
        { label: "cover", value: "cover" },
        { label: "contain", value: "contain" },
        { label: "fill", value: "fill" },
      ],
    },
  ],
  cta: [
    { name: "title", label: "title", type: "text" },
    { name: "description", label: "description", type: "text" },
    { name: "buttonText", label: "buttonText", type: "text", required: true },
    { name: "buttonUrl", label: "buttonUrl", type: "text", required: true },
    {
      name: "buttonVariant",
      label: "buttonVariant",
      type: "select",
      options: [
        { label: "primary", value: "primary" },
        { label: "secondary", value: "secondary" },
        { label: "outline", value: "outline" },
      ],
    },
  ],
  columns: [{ name: "columnsCount", label: "columnsCount", type: "number" }],
  column: [{ name: "width", label: "width", type: "number" }],
  faq: [{ name: "items", label: "items", type: "array" }],
  divider: [
    {
      name: "style",
      label: "style",
      type: "select",
      options: [
        { label: "solid", value: "solid" },
        { label: "dashed", value: "dashed" },
        { label: "dotted", value: "dotted" },
      ],
    },
    { name: "color", label: "color", type: "color" },
    { name: "thickness", label: "thickness", type: "number" },
  ],
  video: [
    { name: "url", label: "url", type: "text", required: true },
    { name: "autoplay", label: "autoplay", type: "checkbox" },
    { name: "controls", label: "controls", type: "checkbox" },
  ],
  gallery: [
    { name: "images", label: "images", type: "array" },
    {
      name: "layout",
      label: "layout",
      type: "select",
      options: [
        { label: "grid", value: "grid" },
        { label: "masonry", value: "masonry" },
        { label: "carousel", value: "carousel" },
      ],
    },
  ],
  pricing: [{ name: "plans", label: "plans", type: "array" }],
  form: [
    { name: "fields", label: "fields", type: "array" },
    { name: "submitLabel", label: "submitLabel", type: "text" },
  ],
};

interface BlockFormProps {
  blockType: BlockType;
  defaultValues: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  id?: string;
}

export function BlockForm({
  blockType,
  defaultValues,
  onSubmit,
  id,
}: BlockFormProps) {
  const t = useTranslations("pageBlock");
  const tErrors = useTranslations("errors");
  const schema = schemas[blockType] ?? z.object({});
  const fields = fieldsMap[blockType] ?? [];
  const form = useForm<Record<string, unknown>>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <form id={id} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {fields.map((field) => {
        const translatedField = {
          ...field,
          label: t(`${blockType}.${field.name}`),
          options: field.options?.map((o) => ({
            ...o,
            label: t(o.value),
          })),
        };
        return (
          <BlockFieldRenderer
            key={field.name}
            field={translatedField}
            value={form.watch(field.name)}
            onChange={(v) => form.setValue(field.name, v)}
            error={
              form.formState.errors[field.name]
                ? tErrors("required")
                : undefined
            }
          />
        );
      })}
      <Button type="submit">{t("blockForm.save")}</Button>
    </form>
  );
}
