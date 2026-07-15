export type SectionBlockProps = {
  title?: string;
  subtitle?: string;
};

export type HeadingBlockProps = {
  text: string;
  level: number;
  alignment?: "left" | "center" | "right";
};

export type ParagraphBlockProps = {
  html: string;
  alignment?: "left" | "center" | "right";
};

export type ImageBlockProps = {
  src: string;
  alt: string;
  caption?: string;
  sizing?: "cover" | "contain" | "fill";
};

export type CtaBlockProps = {
  title?: string;
  description?: string;
  buttonText: string;
  buttonUrl: string;
  buttonVariant?: "primary" | "secondary" | "outline";
};

export type ColumnsBlockProps = {
  columnsCount: number;
};

export type ColumnBlockProps = {
  width?: number;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqBlockProps = {
  items: FaqItem[];
};

export type DividerBlockProps = {
  style?: "solid" | "dashed" | "dotted";
  color?: string;
  thickness?: number;
};

export type VideoBlockProps = {
  url: string;
  autoplay?: boolean;
  controls?: boolean;
};

export type GalleryImage = {
  src: string;
  alt: string;
};

export type GalleryBlockProps = {
  images: GalleryImage[];
  layout?: "grid" | "masonry" | "carousel";
};

export type PricingPlan = {
  name: string;
  price: number;
  currency?: string;
  period?: string;
  features: string;
  ctaText?: string;
  ctaUrl?: string;
};

export type PricingBlockProps = {
  plans: PricingPlan[];
};

export type FormField = {
  type: "text" | "email" | "textarea" | "select" | "checkbox";
  label: string;
  placeholder?: string;
  required?: boolean;
  options: string;
};

export type FormBlockProps = {
  fields: FormField[];
  submitLabel?: string;
};

export type PuckComponents = {
  SectionBlock: SectionBlockProps;
  HeadingBlock: HeadingBlockProps;
  ParagraphBlock: ParagraphBlockProps;
  ImageBlock: ImageBlockProps;
  CtaBlock: CtaBlockProps;
  ColumnsBlock: ColumnsBlockProps;
  ColumnBlock: ColumnBlockProps;
  FaqBlock: FaqBlockProps;
  DividerBlock: DividerBlockProps;
  VideoBlock: VideoBlockProps;
  GalleryBlock: GalleryBlockProps;
  PricingBlock: PricingBlockProps;
  FormBlock: FormBlockProps;
};
