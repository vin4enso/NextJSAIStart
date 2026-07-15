interface GalleryImage {
  src: string;
  alt: string;
}

interface GalleryBlockProps {
  images: GalleryImage[];
  layout?: "grid" | "masonry" | "carousel";
}

export function GalleryBlock({ images }: GalleryBlockProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {images?.map((img, i) => (
        <img key={i} src={img.src} alt={img.alt} className="object-cover" />
      ))}
    </div>
  );
}
