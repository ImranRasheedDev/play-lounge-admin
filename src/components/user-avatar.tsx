"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-xl",
  xl: "h-24 w-24 text-3xl",
};

export function UserAvatar({ src, name, size = "md", className }: UserAvatarProps) {
  // Get initials from name (first letter of first name and first letter of last name)
  const getInitials = (fullName: string): string => {
    const names = fullName.trim().split(/\s+/);
    if (names.length === 0) return "?";
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const initials = getInitials(name);

  if (src) {
    return (
      <div className={cn("relative overflow-hidden rounded-full", sizeClasses[size], className)}>
        <Image
          src={src}
          alt={name}
          fill
          className="object-cover"
          unoptimized={src.includes("localhost") || src.includes("127.0.0.1")}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-primary text-primary-foreground flex items-center justify-center rounded-full font-semibold",
        sizeClasses[size],
        className,
      )}
    >
      {initials}
    </div>
  );
}
