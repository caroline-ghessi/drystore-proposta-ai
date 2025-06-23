
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export const MenuTrigger = React.forwardRef<HTMLButtonElement>((props, ref) => {
  const isMobile = useIsMobile();

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="sm"
      className={`${
        isMobile 
          ? 'text-gray-600 hover:text-gray-900' 
          : 'flex items-center text-sm text-gray-600 hover:text-gray-900'
      }`}
      {...props}
    >
      <Menu className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4 mr-1'}`} />
      {!isMobile && <span>Menu</span>}
      {isMobile && <span className="sr-only">Menu</span>}
    </Button>
  );
});

MenuTrigger.displayName = 'MenuTrigger';
