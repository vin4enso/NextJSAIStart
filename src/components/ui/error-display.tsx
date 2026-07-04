import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorDisplayProps {
  className?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorDisplay({
  className,
  message = "Something went wrong",
  onRetry,
}: ErrorDisplayProps) {
  return (
    <div
      className={cn(
        "text-destructive flex flex-col items-center justify-center py-12",
        className,
      )}
    >
      <AlertTriangle className="mb-3 size-10" />
      <p className="font-medium">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-foreground mt-3 text-sm underline underline-offset-4 hover:no-underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}
