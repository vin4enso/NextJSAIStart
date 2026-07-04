import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
}

export function Empty({
  className,
  icon,
  title = "No data",
  description,
}: EmptyProps) {
  return (
    <div
      className={cn(
        "text-muted-foreground flex flex-col items-center justify-center py-12",
        className,
      )}
    >
      <div className="mb-3">{icon ?? <Inbox className="size-10" />}</div>
      <p className="font-medium">{title}</p>
      {description && <p className="mt-1 text-sm">{description}</p>}
    </div>
  );
}
