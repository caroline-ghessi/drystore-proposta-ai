
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/theme-provider';
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

interface LayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  backPath?: string;
}

const Layout = ({ children, showBackButton = true, backPath }: LayoutProps) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-drystore-orange' : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Back Button */}
              {showBackButton && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleBack}
                  className="mr-2 md:mr-4 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Voltar</span>
                </Button>
              )}
              
              {/* Logo */}
              <Link to="/" className="flex-shrink-0 flex items-center">
                <img 
                  className="h-8 w-auto sm:h-10" 
                  src={theme === 'dark' ? "/lovable-uploads/a7ae23c6-cbea-470d-be2a-44e24862efea.png" : "/lovable-uploads/54b2f5dc-8781-4f2f-9f68-d966142e985d.png"}
                  alt="DryStore" 
                />
              </Link>
              
              {/* Desktop Navigation Links */}
              {user?.role !== 'cliente' && (
                <div className="hidden lg:flex ml-8 space-x-6">
                  <Link
                    to="/proposals"
                    className={`${isActive('/proposals')} px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors`}
                  >
                    Propostas
                  </Link>
                  <Link
                    to="/clients"
                    className={`${isActive('/clients')} px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors`}
                  >
                    Clientes
                  </Link>
                  <Link
                    to="/products"
                    className={`${isActive('/products')} px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors`}
                  >
                    Produtos
                  </Link>
                  <Link
                    to="/follow-up-manager"
                    className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors"
                  >
                    Follow-ups
                  </Link>
                  {/* Admin only links */}
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin/zapi-config"
                      className={`${isActive('/admin/zapi-config')} px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors`}
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
                  className="lg:hidden mr-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                >
                  {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="mr-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
              >
                {theme === 'light' ? (
                  <Moon className="h-[1.2rem] w-[1.2rem]" />
                ) : (
                  <Sun className="h-[1.2rem] w-[1.2rem]" />
                )}
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
                <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <DropdownMenuLabel className="text-gray-900 dark:text-gray-100">Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                  <DropdownMenuItem 
                    onClick={() => navigate('/profile')}
                    className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate('/settings')}
                    className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Mobile Navigation Menu */}
          {isMenuOpen && user?.role !== 'cliente' && (
            <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 py-4 bg-white dark:bg-gray-800">
              <div className="flex flex-col space-y-2">
                <Link
                  to="/proposals"
                  className={`${isActive('/proposals')} px-3 py-2 rounded-md text-base font-medium block transition-colors`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Propostas
                </Link>
                <Link
                  to="/clients"
                  className={`${isActive('/clients')} px-3 py-2 rounded-md text-base font-medium block transition-colors`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Clientes
                </Link>
                <Link
                  to="/products"
                  className={`${isActive('/products')} px-3 py-2 rounded-md text-base font-medium block transition-colors`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Produtos
                </Link>
                <Link
                  to="/follow-up-manager"
                  className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 px-3 py-2 rounded-md text-base font-medium block transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Follow-ups WhatsApp
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin/zapi-config"
                    className={`${isActive('/admin/zapi-config')} px-3 py-2 rounded-md text-base font-medium block transition-colors`}
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
