import { cn } from "@/lib/utils";

interface DataToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export function DataToolbar({ children, className }: DataToolbarProps) {
  return (
    <div
      className={cn("mb-4 flex items-center justify-between gap-4", className)}
    >
      {children}
    </div>
  );
}
