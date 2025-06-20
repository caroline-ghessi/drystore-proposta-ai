
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { Moon, Sun, ArrowLeft, Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';

interface LayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  backPath?: string;
}

const Layout = ({ children, showBackButton = true, backPath }: LayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { setTheme, theme } = useTheme();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Back Button */}
              {showBackButton && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleBack}
                  className="mr-2 md:mr-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Voltar</span>
                </Button>
              )}
              
              {/* Logo */}
              <Link to="/" className="flex-shrink-0 flex items-center">
                <img 
                  className="h-6 w-auto sm:h-8" 
                  src="https://tailwindui.com/img/logos/mark.svg?color=blue&shade=600" 
                  alt="Logo da Empresa" 
                />
                <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900">DryStore</span>
              </Link>
              
              {/* Desktop Navigation Links */}
              {user?.role !== 'cliente' && (
                <div className="hidden lg:flex ml-8 space-x-6">
                  <Link
                    to="/proposals"
                    className={`${isActive('/proposals')} px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap`}
                  >
                    Propostas
                  </Link>
                  <Link
                    to="/clients"
                    className={`${isActive('/clients')} px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap`}
                  >
                    Clientes
                  </Link>
                  <Link
                    to="/products"
                    className={`${isActive('/products')} px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap`}
                  >
                    Produtos
                  </Link>
                  <Link
                    to="/follow-up-manager"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap"
                  >
                    Follow-ups
                  </Link>
                  {/* Admin only links */}
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin/zapi-config"
                      className={`${isActive('/admin/zapi-config')} px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap`}
                    >
                      Config Z-API
                    </Link>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center ml-4 md:ml-6">
              {/* Mobile menu button */}
              {user?.role !== 'cliente' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMenu}
                  className="lg:hidden mr-2"
                >
                  {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="mr-2"
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Mobile Navigation Menu */}
          {isMenuOpen && user?.role !== 'cliente' && (
            <div className="lg:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-2">
                <Link
                  to="/proposals"
                  className={`${isActive('/proposals')} px-3 py-2 rounded-md text-base font-medium block`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Propostas
                </Link>
                <Link
                  to="/clients"
                  className={`${isActive('/clients')} px-3 py-2 rounded-md text-base font-medium block`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Clientes
                </Link>
                <Link
                  to="/products"
                  className={`${isActive('/products')} px-3 py-2 rounded-md text-base font-medium block`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Produtos
                </Link>
                <Link
                  to="/follow-up-manager"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Follow-ups WhatsApp
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin/zapi-config"
                    className={`${isActive('/admin/zapi-config')} px-3 py-2 rounded-md text-base font-medium block`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Config Z-API
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
      
      <main className="flex-1 py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
