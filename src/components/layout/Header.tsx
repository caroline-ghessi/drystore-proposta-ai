
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Menu, X } from 'lucide-react';
import NavigationLinks from './NavigationLinks';
import { MobileNavigationMenu } from './MobileNavigationMenu';
import { UserMenu } from './UserMenu';

interface HeaderProps {
  showBackButton?: boolean;
  backPath?: string;
}

export const Header = ({ showBackButton = true, backPath }: HeaderProps) => {
  const { user } = useAuth();
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

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {/* Back Button */}
            {showBackButton && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleBack}
                className="mr-2 md:mr-4 text-gray-700 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Voltar</span>
              </Button>
            )}
            
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img 
                className="h-8 w-auto sm:h-10" 
                src="/lovable-uploads/54b2f5dc-8781-4f2f-9f68-d966142e985d.png"
                alt="DryStore" 
              />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="flex-1 flex justify-center">
            <NavigationLinks />
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="lg:hidden text-gray-700 hover:text-gray-900"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            <UserMenu />
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <MobileNavigationMenu />
          </div>
        )}
      </div>
    </nav>
  );
};
