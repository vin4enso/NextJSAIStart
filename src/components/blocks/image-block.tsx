interface ImageBlockProps {
  src: string;
  alt: string;
  caption?: string;
  sizing?: "cover" | "contain" | "fill";
}

export function ImageBlock({ src, alt, caption, sizing }: ImageBlockProps) {
  return (
    <figure>
      <img
        src={src}
        alt={alt}
        className={sizing ? `object-${sizing}` : undefined}
      />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
