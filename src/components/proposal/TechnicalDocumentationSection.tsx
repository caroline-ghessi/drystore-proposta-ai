
import { FileText } from 'lucide-react';
import { TechnicalFeaturesGrid } from './TechnicalFeaturesGrid';
import { TechnicalImagesSection } from './TechnicalImagesSection';
import { TechnicalDownloadsSection } from './TechnicalDownloadsSection';
import { QualityAssuranceSection } from './QualityAssuranceSection';

export const TechnicalDocumentationSection = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full mr-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              🔧 Documentação Técnica Completa
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Desenvolvemos uma solução técnica personalizada para você. Confira toda a documentação 
            detalhada que comprova o cuidado e precisão na elaboração do seu projeto.
          </p>
        </div>

        <TechnicalFeaturesGrid />
        <TechnicalImagesSection />
        <TechnicalDownloadsSection />
        <QualityAssuranceSection />
      </div>
    </div>
  );
};
