
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Menu } from "lucide-react";

export function DisponentDashboard() {
  return (
    <div className="p-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-9 w-9 rounded-full"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menü öffnen</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Menü</DialogTitle>
            <DialogDescription>
              Hier können Sie Ihre Einstellungen verwalten.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>Menüinhalt kommt hier hin.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
