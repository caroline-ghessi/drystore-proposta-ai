import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Target, FileText, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp, Plus } from 'lucide-react';

export function MobileNavigationMenu() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Menu className="w-6 h-6" />
      </SheetTrigger>
      <SheetContent className="w-64">
        <SheetHeader className="text-left">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Navegue pelas opções do sistema
          </SheetDescription>
        </SheetHeader>

        <div className="py-4">
          <div className="px-4 py-2 flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>{user?.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none">{user?.name}</p>
              <p className="text-sm text-gray-500 leading-none">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-1">
          <Link
            to="/dashboard"
            className={cn(
              "flex items-center space-x-3 px-4 py-3 text-base font-medium transition-colors",
              location.pathname === '/dashboard'
                ? "text-drystore-blue bg-blue-50"
                : "text-gray-600 hover:text-drystore-blue hover:bg-gray-50"
            )}
            onClick={() => setIsOpen(false)}
          >
            <TrendingUp className="w-6 h-6" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/proposals"
            className={cn(
              "flex items-center space-x-3 px-4 py-3 text-base font-medium transition-colors",
              location.pathname === '/proposals'
                ? "text-drystore-blue bg-blue-50"
                : "text-gray-600 hover:text-drystore-blue hover:bg-gray-50"
            )}
            onClick={() => setIsOpen(false)}
          >
            <FileText className="w-6 h-6" />
            <span>Propostas</span>
          </Link>

          <Link
            to="/create-proposal"
            className={cn(
              "flex items-center space-x-3 px-4 py-3 text-base font-medium transition-colors",
              location.pathname === '/create-proposal'
                ? "text-drystore-blue bg-blue-50"
                : "text-gray-600 hover:text-drystore-blue hover:bg-gray-50"
            )}
            onClick={() => setIsOpen(false)}
          >
            <Plus className="w-6 h-6" />
            <span>Criar Proposta</span>
          </Link>

          {(user?.role === 'admin') && (
            <Link
              to="/sales-targets"
              className={cn(
                "flex items-center space-x-3 px-4 py-3 text-base font-medium transition-colors",
                location.pathname === '/sales-targets'
                  ? "text-drystore-blue bg-blue-50"
                  : "text-gray-600 hover:text-drystore-blue hover:bg-gray-50"
              )}
              onClick={() => setIsOpen(false)}
            >
              <Target className="w-6 h-6" />
              <span>Metas de Vendas</span>
            </Link>
          )}

          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-gray-600 hover:text-drystore-blue hover:bg-gray-50 transition-colors"
          >
            <AlertCircle className="w-6 h-6" />
            <span>Sair</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
