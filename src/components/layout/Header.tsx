
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Menu } from 'lucide-react';
import { UserMenu } from './UserMenu';

interface HeaderProps {
  showBackButton?: boolean;
  backPath?: string;
}

export const Header = ({ showBackButton = true, backPath }: HeaderProps) => {
  const navigate = useNavigate();

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
            <div className="flex-shrink-0 flex items-center">
              <img 
                className="h-8 w-auto sm:h-10" 
                src="/lovable-uploads/54b2f5dc-8781-4f2f-9f68-d966142e985d.png"
                alt="DryStore" 
              />
            </div>
          </div>
          
          {/* Right Side - Menu Icon + User Menu */}
          <div className="flex items-center space-x-2">
            {/* Menu Icon */}
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900 lg:hidden"
            >
              <Menu className="w-5 h-5" />
              <span className="sr-only">Menu</span>
            </Button>
            
            {/* Desktop Menu Text */}
            <div className="hidden lg:flex items-center text-sm text-gray-600 mr-2">
              <Menu className="w-4 h-4 mr-1" />
              <span>Menu</span>
            </div>
            
            {/* User Menu */}
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
};
