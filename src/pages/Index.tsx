
import IndexHeader from '@/components/index/IndexHeader';
import WelcomeSection from '@/components/index/WelcomeSection';
import ClientLoginCard from '@/components/index/ClientLoginCard';
import VendorLoginCard from '@/components/index/VendorLoginCard';
import LoginFooter from '@/components/index/LoginFooter';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-drystore-gray-light via-white to-gray-100">
      <IndexHeader />

      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] p-4">
        <div className="w-full max-w-6xl">
          <WelcomeSection />

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <ClientLoginCard />
            <VendorLoginCard />
          </div>

          <LoginFooter />
        </div>
      </div>
    </div>
  );
};

export default Index;
