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
import type { PageBlock } from "@/schemas/page-block";

type BlockWithChildren = PageBlock & { children?: BlockWithChildren[] };

interface BlockRendererProps {
  blocks: BlockWithChildren[];
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

function BlockRendererItem({ block }: { block: BlockWithChildren }) {
  switch (block.blockType) {
    case "section":
      return <SectionBlock block={block} />;
    case "heading":
      return <HeadingBlock block={block} />;
    case "paragraph":
      return <ParagraphBlock block={block} />;
    case "image":
      return <ImageBlock block={block} />;
    case "cta":
      return <CtaBlock block={block} />;
    case "columns":
      return <ColumnsBlock block={block} />;
    case "faq":
      return <FaqBlock block={block} />;
    case "divider":
      return <DividerBlock block={block} />;
    case "video":
      return <VideoBlock block={block} />;
    case "gallery":
      return <GalleryBlock block={block} />;
    case "pricing":
      return <PricingBlock block={block} />;
    case "form":
      return <FormBlock block={block} />;
    default:
      return null;
  }
}
