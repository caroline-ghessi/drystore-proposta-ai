
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MenuItem } from './MenuData';

interface MenuSectionProps {
  title: string;
  items: MenuItem[];
  showSection?: boolean;
}

export const MenuSection = ({ title, items, showSection = true }: MenuSectionProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (!showSection) return null;

  const visibleItems = items.filter(item => item.show);
  
  if (visibleItems.length === 0) return null;

  return (
    <>
      <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
      <DropdownMenuLabel className="text-gray-900 dark:text-gray-100">{title}</DropdownMenuLabel>
      <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
      {visibleItems.map((item) => (
        <DropdownMenuItem 
          key={item.path}
          onClick={() => navigate(item.path)}
          className={`flex items-center space-x-2 cursor-pointer ${
            location.pathname === item.path 
              ? 'bg-drystore-orange text-white' 
              : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <item.icon className="w-4 h-4" />
          <span>{item.label}</span>
        </DropdownMenuItem>
      ))}
    </>
  );
};
