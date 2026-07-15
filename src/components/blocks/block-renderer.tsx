import { HeadingBlock } from "./heading-block";
import { ParagraphBlock } from "./paragraph-block";
import { ImageBlock } from "./image-block";
import { SectionBlock } from "./section-block";
import { CtaBlock } from "./cta-block";
import { ColumnsBlock } from "./columns-block";
import { FaqBlock } from "./faq-block";
import { DividerBlock } from "./divider-block";
import { VideoBlock } from "./video-block";
import { GalleryBlock } from "./gallery-block";
import { PricingBlock } from "./pricing-block";
import { FormBlock } from "./form-block";

interface BlockRecord {
  id: string;
  pageId: string;
  blockType: string;
  sortOrder: number;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  children?: BlockRecord[];
}

interface BlockRendererProps {
  blocks: BlockRecord[];
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
  if (blocks.length === 0) return null;

  return (
    <>
      {blocks.map((block) => (
        <BlockRendererItem key={block.id} block={block} />
      ))}
    </>
  );
}

function BlockRendererItem({ block }: { block: BlockRecord }) {
  const children =
    block.children && block.children.length > 0 ? (
      <BlockRenderer blocks={block.children} />
    ) : null;

  switch (block.blockType) {
    case "section":
      return (
        <SectionBlock
          title={block.config.title as string | undefined}
          subtitle={block.config.subtitle as string | undefined}
        >
          {children}
        </SectionBlock>
      );
    case "heading":
      return (
        <HeadingBlock
          text={block.config.text as string}
          level={block.config.level as number | undefined}
          alignment={
            block.config.alignment as "left" | "center" | "right" | undefined
          }
        />
      );
    case "paragraph":
      return (
        <ParagraphBlock
          html={block.config.html as string}
          alignment={
            block.config.alignment as "left" | "center" | "right" | undefined
          }
        />
      );
    case "image":
      return (
        <ImageBlock
          src={block.config.src as string}
          alt={block.config.alt as string}
          caption={block.config.caption as string | undefined}
          sizing={
            block.config.sizing as "cover" | "contain" | "fill" | undefined
          }
        />
      );
    case "cta":
      return (
        <CtaBlock
          title={block.config.title as string | undefined}
          description={block.config.description as string | undefined}
          buttonText={block.config.buttonText as string}
          buttonUrl={block.config.buttonUrl as string}
          buttonVariant={
            block.config.buttonVariant as
              "primary" | "secondary" | "outline" | undefined
          }
        />
      );
    case "columns":
      return (
        <ColumnsBlock columnsCount={block.config.columnsCount as number}>
          {children}
        </ColumnsBlock>
      );
    case "column":
      return <>{children}</>;
    case "faq":
      return (
        <FaqBlock
          items={
            (block.config.items as Array<{
              question: string;
              answer: string;
            }>) ?? []
          }
        />
      );
    case "divider":
      return (
        <DividerBlock
          style={
            block.config.style as "solid" | "dashed" | "dotted" | undefined
          }
          color={block.config.color as string | undefined}
          thickness={block.config.thickness as number | undefined}
        />
      );
    case "video":
      return (
        <VideoBlock
          url={block.config.url as string}
          autoplay={block.config.autoplay as boolean | undefined}
          controls={block.config.controls as boolean | undefined}
        />
      );
    case "gallery":
      return (
        <GalleryBlock
          images={
            (block.config.images as Array<{ src: string; alt: string }>) ?? []
          }
          layout={
            block.config.layout as "grid" | "masonry" | "carousel" | undefined
          }
        />
      );
    case "pricing":
      return (
        <PricingBlock
          plans={
            (block.config.plans as Array<{
              name: string;
              price: number;
              currency?: string;
              period?: string;
              features: string;
              ctaText?: string;
              ctaUrl?: string;
            }>) ?? []
          }
        />
      );
    case "form":
      return (
        <FormBlock
          fields={
            (block.config.fields as Array<{
              type: "text" | "email" | "textarea" | "select" | "checkbox";
              label: string;
              placeholder?: string;
              required?: boolean;
              options: string;
            }>) ?? []
          }
          submitLabel={block.config.submitLabel as string | undefined}
        />
      );
    default:
      return null;
  }
}
