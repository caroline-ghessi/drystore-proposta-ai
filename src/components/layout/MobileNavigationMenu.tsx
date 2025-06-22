
import React from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, FileText, Users, Settings, Target, LogOut } from 'lucide-react';

export function MobileNavigationMenu() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="bg-white border-t border-gray-200 shadow-lg">
      <div className="py-2">
        <div className="flex flex-col space-y-1">
          <Link
            to="/dashboard"
            className={cn(
              "flex items-center space-x-3 px-4 py-3 text-base font-medium transition-colors",
              location.pathname === '/dashboard'
                ? "text-drystore-blue bg-blue-50"
                : "text-gray-600 hover:text-drystore-blue hover:bg-gray-50"
            )}
          >
            <Home className="w-5 h-5" />
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
          >
            <FileText className="w-5 h-5" />
            <span>Propostas</span>
          </Link>

          {(user?.role === 'admin' || user?.role === 'vendedor_interno') && (
            <Link
              to="/clients"
              className={cn(
                "flex items-center space-x-3 px-4 py-3 text-base font-medium transition-colors",
                location.pathname === '/clients'
                  ? "text-drystore-blue bg-blue-50"
                  : "text-gray-600 hover:text-drystore-blue hover:bg-gray-50"
              )}
            >
              <Users className="w-5 h-5" />
              <span>Clientes</span>
            </Link>
          )}

          {(user?.role === 'admin') && (
            <Link
              to="/sales-targets"
              className={cn(
                "flex items-center space-x-3 px-4 py-3 text-base font-medium transition-colors",
                location.pathname === '/sales-targets'
                  ? "text-drystore-blue bg-blue-50"
                  : "text-gray-600 hover:text-drystore-blue hover:bg-gray-50"
              )}
            >
              <Target className="w-5 h-5" />
              <span>Metas de Vendas</span>
            </Link>
          )}

          {(user?.role === 'admin') && (
            <Link
              to="/settings"
              className={cn(
                "flex items-center space-x-3 px-4 py-3 text-base font-medium transition-colors",
                location.pathname === '/settings'
                  ? "text-drystore-blue bg-blue-50"
                  : "text-gray-600 hover:text-drystore-blue hover:bg-gray-50"
              )}
            >
              <Settings className="w-5 h-5" />
              <span>Configurações</span>
            </Link>
          )}

          <div className="border-t border-gray-200 pt-2">
            <button
              onClick={logout}
              className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-gray-600 hover:text-drystore-blue hover:bg-gray-50 transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
