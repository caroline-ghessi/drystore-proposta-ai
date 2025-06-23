
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export const MenuTrigger = () => {
  return (
    <div className="flex items-center space-x-2 cursor-pointer">
      {/* Menu Button - Desktop */}
      <Button
        variant="ghost"
        size="sm"
        className="hidden lg:flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <Menu className="w-4 h-4 mr-1" />
        <span>Menu</span>
      </Button>
      
      {/* Menu Button - Mobile */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden text-gray-600 hover:text-gray-900"
      >
        <Menu className="w-5 h-5" />
        <span className="sr-only">Menu</span>
      </Button>
    </div>
  );
};
