"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LocateFixed } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function LocationInput({ value, onChange }: LocationInputProps) {
  const [isFetching, setIsFetching] = useState(false);
  const { toast } = useToast();

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      toast({ variant: 'destructive', title: "Geolocation wird nicht unterstützt." });
      return;
    }

    setIsFetching(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationString = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        onChange(locationString);
        toast({ title: "Standort erfasst." });
        setIsFetching(false);
      },
      (error) => {
        let message = "Standort konnte nicht abgerufen werden.";
        if (error.code === error.PERMISSION_DENIED) {
            message = "Berechtigung zum Abrufen des Standorts verweigert.";
        }
        toast({ variant: 'destructive', title: message });
        setIsFetching(false);
      }
    );
  };
  
  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="z.B. Manten oder 52.520, 13.405"
        className="pr-10"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute inset-y-0 right-0 h-full"
        onClick={fetchLocation}
        disabled={isFetching}
        aria-label="Standort abrufen"
      >
        <LocateFixed className={`h-4 w-4 ${isFetching ? 'animate-pulse' : ''}`} />
      </Button>
    </div>
  );
}
