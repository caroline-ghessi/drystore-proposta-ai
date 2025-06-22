
import { Header } from './layout/Header';

interface LayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  backPath?: string;
}

const Layout = ({ children, showBackButton = true, backPath }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 transition-colors">
      <Header showBackButton={showBackButton} backPath={backPath} />
      
      <main className="flex-1 py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
