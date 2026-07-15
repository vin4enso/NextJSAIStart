interface CtaBlockProps {
  title?: string;
  description?: string;
  buttonText: string;
  buttonUrl: string;
  buttonVariant?: "primary" | "secondary" | "outline";
}

export function CtaBlock({
  title,
  description,
  buttonText,
  buttonUrl,
}: CtaBlockProps) {
  return (
    <div>
      {title ? <h3>{title}</h3> : null}
      {description ? <p>{description}</p> : null}
      <a href={buttonUrl}>{buttonText}</a>
    </div>
  );
}
