"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  src?: string | null;
  name: string;
  onFileSelect: (file: File) => void;
  className?: string;
}

export function AvatarUpload({
  src,
  name,
  onFileSelect,
  className,
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    onFileSelect(file);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const currentSrc = preview ?? src;
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn("relative inline-block", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={handleClick}
        className="group relative cursor-pointer"
      >
        <Avatar size="lg">
          {currentSrc ? (
            <AvatarImage src={currentSrc} alt={name} />
          ) : (
            <AvatarFallback>{initials}</AvatarFallback>
          )}
        </Avatar>
        <div className="bg-foreground/60 absolute inset-0 flex items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100">
          <Camera className="text-background size-5" />
        </div>
      </button>
    </div>
  );
}
