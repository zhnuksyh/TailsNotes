import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: user } = useQuery<{
    id: string;
    username: string;
    email: string;
  }>({
    queryKey: ['/api/user'],
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'JD';
  };

  return (
    <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-poppins font-semibold text-foreground hidden sm:block">
          TailsNotes
        </h1>
      </div>
      
      {/* Profile Section */}
      <div className="relative" ref={dropdownRef}>
        <Button
          variant="ghost"
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-all"
          onClick={() => setIsProfileOpen(!isProfileOpen)}
        >
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-gradient-orange-yellow text-primary-foreground font-medium text-sm font-poppins">
              {getUserInitials(user?.username, user?.email)}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </Button>
        
        {/* Profile Dropdown */}
        {isProfileOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-card rounded-lg shadow-lg border border-border py-2 z-50">
            {user && (
              <div className="px-4 py-2 border-b border-border">
                <div className="font-medium text-sm text-foreground font-poppins">
                  {user.username}
                </div>
                <div className="text-xs text-muted-foreground font-helvetica">
                  {user.email}
                </div>
              </div>
            )}
            
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-2 text-sm text-foreground hover:bg-muted font-helvetica"
            >
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              Profile Settings
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-2 text-sm text-foreground hover:bg-muted font-helvetica"
            >
              <Settings className="h-4 w-4 mr-2 text-muted-foreground" />
              Preferences
            </Button>
            
            <hr className="my-2 border-border" />
            
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-2 text-sm text-destructive hover:bg-destructive/10 font-helvetica"
            >
              <LogOut className="h-4 w-4 mr-2 text-destructive" />
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
