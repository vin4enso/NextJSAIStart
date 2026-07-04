import { cn } from "@/lib/utils";

interface LoadingProps {
  className?: string;
  text?: string;
}

export function Loading({ className, text }: LoadingProps) {
  return (
    <div
      className={cn(
        "text-muted-foreground flex flex-col items-center justify-center py-12",
        className,
      )}
    >
      <div className="border-primary size-8 animate-spin rounded-full border-2 border-t-transparent" />
      {text && <p className="mt-3 text-sm">{text}</p>}
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className="bg-muted h-4 flex-1 animate-pulse rounded"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
