
"use client";

import { useAuth } from '@/context/AuthContext';
import { useTour } from '@/context/TourContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Truck, LogOut, Map, UserCog } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';

export function Header() {
  const { user, logout, isAuthenticated, userRole } = useAuth();
  const { endTour, activeTour } = useTour();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    endTour();
    router.push('/login');
  };

  const handleEndTour = () => {
    router.push('/tour-summary');
  }
  
  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <Truck className="h-6 w-6 text-primary" />
            <span className="inline-block font-bold font-headline text-xl">FahrerLogbuch</span>
          </Link>
        </div>
        
        {isAuthenticated && (
          <div className="flex flex-1 items-center justify-end space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(user)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Angemeldet als</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user} ({userRole})
                    </p>
                  </div>
                </DropdownMenuLabel>
                {activeTour && (
                   <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Aktuelle Tour</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {activeTour.transport_order}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                )}
                <DropdownMenuSeparator />
                {userRole === 'admin' && (
                  <DropdownMenuItem onClick={() => router.push('/admin')}>
                    <UserCog className="mr-2 h-4 w-4" />
                    <span>Admin Panel</span>
                  </DropdownMenuItem>
                )}
                {activeTour && (
                  <DropdownMenuItem onClick={handleEndTour}>
                    <Map className="mr-2 h-4 w-4" />
                    <span>Tour beenden</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Abmelden</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}
