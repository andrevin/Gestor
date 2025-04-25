import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LogOut, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const [_, navigate] = useLocation();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const navigateToAdmin = () => {
    navigate("/admin");
  };
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <img src="Logo Italimentos OF.webp" alt="Italimentos" className="h-8 w-auto" />
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-secondary">
              Bienvenido, {user?.fullName || 'Usuario'}
            </span>
            
            {user?.isAdmin && (
              <Button 
                variant="ghost" 
                size="icon"
                className="text-secondary hover:text-primary"
                onClick={navigateToAdmin}
              >
                <Settings className="h-5 w-5" />
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  <span>Cerrar Sesión</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  Confirmar cierre de sesión
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Cancelar</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
