
"use client";

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function DisponentDashboard() {
  return (
    <div className="p-4">
      <Button
        variant="ghost"
        className="relative h-9 w-9 rounded-full"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Menü öffnen</span>
      </Button>
    </div>
  );
}
