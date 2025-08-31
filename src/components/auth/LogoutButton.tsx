"use client";

import { useAuth } from "@/context/AuthContext";
import { useTour } from "@/context/TourContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
    const { logout } = useAuth();
    const { endTour } = useTour();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        endTour();
        router.push('/login');
    };

    return (
        <Button variant="link" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Abmelden
        </Button>
    );
}
