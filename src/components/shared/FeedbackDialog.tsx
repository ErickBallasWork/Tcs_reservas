"use client";

import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type FeedbackVariant = "success" | "error" | "info";

const variants = {
  success: { Icon: CheckCircle2, badge: "bg-brand text-white" },
  error: { Icon: AlertTriangle, badge: "bg-gold text-brand-dark" },
  info: { Icon: Info, badge: "bg-soft text-brand" },
};

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: FeedbackVariant;
  title: string;
  description: string;
  children?: React.ReactNode;
  footer: React.ReactNode;
}

export function FeedbackDialog({
  open,
  onOpenChange,
  variant = "info",
  title,
  description,
  children,
  footer,
}: FeedbackDialogProps) {
  const { Icon, badge } = variants[variant];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-4 rounded-[14px] p-6 sm:max-w-[540px]">
        <div
          className={cn(
            "flex size-12 items-center justify-center rounded-full",
            badge,
          )}
        >
          <Icon className="size-6" aria-hidden />
        </div>
        <DialogHeader className="gap-1.5 text-left">
          <DialogTitle className="text-lg font-bold text-brand">
            {title}
          </DialogTitle>
          <DialogDescription className="text-ink-soft">
            {description}
          </DialogDescription>
        </DialogHeader>
        {children}
        <DialogFooter className="gap-2 sm:justify-end">{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}