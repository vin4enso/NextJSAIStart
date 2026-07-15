import type { ReactNode } from "react";

interface ColumnsBlockProps {
  columnsCount: number;
  children?: ReactNode;
}

export function ColumnsBlock({ columnsCount, children }: ColumnsBlockProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columnsCount}, 1fr)`,
        gap: "1rem",
      }}
    >
      {children}
    </div>
  );
}
