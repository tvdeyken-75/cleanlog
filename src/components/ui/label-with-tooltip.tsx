"use client"

import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import React from "react";

interface LabelWithTooltipProps extends React.ComponentProps<typeof Label> {
  tooltipText: string;
}

export function LabelWithTooltip({ children, tooltipText, ...props }: LabelWithTooltipProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Label {...props}>{children}</Label>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
