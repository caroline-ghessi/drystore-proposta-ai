
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Moon, Sun, ArrowLeft, Menu, X } from 'lucide-react';
import { NavigationLinks } from './NavigationLinks';
import { MobileNavigationMenu } from './MobileNavigationMenu';
import { UserMenu } from './UserMenu';

interface HeaderProps {
  showBackButton?: boolean;
  backPath?: string;
}

export const Header = ({ showBackButton = true, backPath }: HeaderProps) => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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

  return (
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
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Desktop Navigation Links */}
            <NavigationLinks />
            
            {/* Mobile menu button */}
            {user?.role !== 'cliente' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMenu}
                className="lg:hidden text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
            >
              {theme === 'light' ? (
                <Moon className="h-[1.2rem] w-[1.2rem]" />
              ) : (
                <Sun className="h-[1.2rem] w-[1.2rem]" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            <UserMenu />
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        <MobileNavigationMenu 
          isMenuOpen={isMenuOpen} 
          onMenuClose={() => setIsMenuOpen(false)} 
        />
      </div>
    </nav>
  );
};
