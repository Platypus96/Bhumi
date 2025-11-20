"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Check, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CopyButtonProps {
  textToCopy: string;
  size?: "sm" | "icon" | "default" | "lg";
  className?: string;
}

export function CopyButton({ textToCopy, size = "icon", className }: CopyButtonProps) {
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setHasCopied(true);
    toast({ title: "Copied!", description: "The address has been copied to your clipboard." });
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  };

  return (
    <Button variant="ghost" size={size} onClick={handleCopy} className={className}>
      {hasCopied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      <span className="sr-only">Copy</span>
    </Button>
  );
}
