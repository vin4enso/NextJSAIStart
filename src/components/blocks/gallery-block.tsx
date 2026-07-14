import type { PageBlock } from "@/schemas/page-block";

type BlockWithChildren = PageBlock & { children?: PageBlock[] };

interface GalleryBlockProps {
  block: BlockWithChildren;
}

export function GalleryBlock({ block }: GalleryBlockProps) {
  const config = block.config as Record<string, unknown>;
  const images = config.images as
    Array<{ src: string; alt: string }> | undefined;
  return (
    <div className="grid grid-cols-3 gap-2">
      {images?.map((img, i) => (
        <img key={i} src={img.src} alt={img.alt} className="object-cover" />
      ))}
    </div>
  );
}
