interface VideoBlockProps {
  url: string;
  autoplay?: boolean;
  controls?: boolean;
}

export function VideoBlock({ url, controls }: VideoBlockProps) {
  return (
    <div>
      <iframe
        src={url}
        allow="autoplay; fullscreen"
        allowFullScreen={!!controls}
        className="aspect-video w-full"
      />
    </div>
  );
}
