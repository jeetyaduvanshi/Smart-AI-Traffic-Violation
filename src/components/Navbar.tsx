import React from 'react';
import { Shield, Sun, Moon, User, LogOut, History, Upload, Home } from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useTheme } from './ThemeContext';
import { useAuth } from './AuthContext';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'history', label: 'History', icon: History },
  ];

  const handleSignOut = async () => {
    await signOut();
    onNavigate('landing');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <div className="relative p-2 rounded-xl bg-slate-800 dark:bg-slate-900 border border-slate-600 shadow-lg group">
              <div className="flex flex-col space-y-1">
                {/* Red Light */}
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg group-hover:shadow-red-500/50 transition-all duration-300 group-hover:animate-pulse">
                    <div className="absolute inset-0 rounded-full bg-red-400 opacity-0 group-hover:opacity-100 group-hover:animate-ping"></div>
                  </div>
                </div>
                {/* Yellow Light */}
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg group-hover:shadow-yellow-500/50 transition-all duration-300 delay-100 group-hover:animate-pulse">
                    <div className="absolute inset-0 rounded-full bg-yellow-400 opacity-0 group-hover:opacity-100 group-hover:animate-ping delay-100"></div>
                  </div>
                </div>
                {/* Green Light */}
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg group-hover:shadow-green-500/50 transition-all duration-300 delay-200 group-hover:animate-pulse">
                    <div className="absolute inset-0 rounded-full bg-green-400 opacity-0 group-hover:opacity-100 group-hover:animate-ping delay-200"></div>
                  </div>
                </div>
              </div>
              {/* Lightning glow effect on hover */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/20 via-yellow-500/20 to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
            </div>
            <span className="font-bold text-xl not-italic no-underline text-left mx-[3px] my-[0px] p-[0px] text-[24px]">Smart Traffic AI</span>
          </div>

          {/* Navigation Links - Only show when authenticated */}
          {user && (
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? 'default' : 'ghost'}
                    onClick={() => onNavigate(item.id)}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </div>
          )}

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <div className="flex items-center space-x-2">
              <Sun className={`h-4 w-4 ${isDark ? 'text-muted-foreground' : 'text-yellow-500'}`} />
              <Switch
                checked={isDark}
                onCheckedChange={toggleTheme}
                className="data-[state=checked]:bg-slate-700"
              />
              <Moon className={`h-4 w-4 ${isDark ? 'text-blue-400' : 'text-muted-foreground'}`} />
            </div>

            {/* User Menu - Only show when authenticated */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 text-white">
                        {user.user_metadata?.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">
                      {user.user_metadata?.name || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onNavigate('profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={() => onNavigate('login')}>
                  Sign In
                </Button>
                <Button onClick={() => onNavigate('signup')}>
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation - Only show when authenticated */}
        {user && (
          <div className="md:hidden border-t py-2">
            <div className="flex items-center justify-around">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onNavigate(item.id)}
                    className="flex flex-col items-center space-y-1 h-auto py-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
