interface DividerBlockProps {
  style?: "solid" | "dashed" | "dotted";
  color?: string;
  thickness?: number;
}

export function DividerBlock({ style, color, thickness }: DividerBlockProps) {
  return (
    <hr
      style={{
        borderStyle: style ?? "solid",
        borderColor: color ?? undefined,
        borderWidth: thickness ? `${thickness}px` : undefined,
      }}
    />
  );
}
