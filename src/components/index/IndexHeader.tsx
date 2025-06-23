
import DrystoreCube from '@/components/DrystoreCube';

const IndexHeader = () => {
  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-20">
          <div className="flex items-center space-x-4">
            <DrystoreCube size="lg" />
            <div className="text-center">
              <span className="text-3xl font-bold text-drystore-gray-dark">
                Drystore
              </span>
              <div className="text-base text-drystore-gray-medium">
                Soluções Inteligentes
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default IndexHeader;
