
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
import { LayoutDashboard, Menu, Truck } from "lucide-react";
import Link from 'next/link';

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
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Menü</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Link href="/disponent" passHref>
                <Button variant="ghost" className="w-full justify-start">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                </Button>
            </Link>
            <Link href="/disponent/planung" passHref>
                 <Button variant="ghost" className="w-full justify-start">
                    <Truck className="mr-2 h-4 w-4" />
                    Tourplanung
                </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
