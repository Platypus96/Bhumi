import { User, Fingerprint } from "lucide-react";
import { CopyButton } from "./copy-button";
import { cn } from "@/lib/utils";

interface HashPillProps {
  hash: string;
  type: "address" | "parcel";
  className?: string;
}

function truncateHash(hash: string, startChars = 6, endChars = 4) {
  if (!hash) return "";
  return `${hash.substring(0, startChars)}...${hash.substring(hash.length - endChars)}`;
}

export function HashPill({ hash, type, className }: HashPillProps) {
  const Icon = type === "address" ? User : Fingerprint;
  const truncated = type === 'address' ? truncateHash(hash) : truncateHash(hash, 10, 6);

  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full bg-secondary text-secondary-foreground px-2 py-1 text-xs font-mono", className)}>
      <Icon className="h-3.5 w-3.5" />
      <span className="font-semibold">{truncated}</span>
      <CopyButton textToCopy={hash} size="sm" className="h-6 w-6" />
    </span>
  );
}
