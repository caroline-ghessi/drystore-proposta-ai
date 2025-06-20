
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import UploadTypeSelector from '@/components/proposal/UploadTypeSelector';
import ERPUploader from '@/components/proposal/ERPUploader';

const ProposalUploadChoice = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<'architectural' | 'erp' | null>(null);

  const handleTypeSelection = (type: 'architectural' | 'erp') => {
    setSelectedType(type);
    
    if (type === 'architectural') {
      // Redireciona para o upload de documento arquitetônico existente
      navigate('/upload-document');
    }
  };

  const handleERPUploadComplete = (extractedData: any) => {
    // Armazena os dados extraídos e vai direto para edição/preview
    sessionStorage.setItem('erpProposalData', JSON.stringify(extractedData));
    navigate('/edit-proposal');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/create-proposal')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tipo de Upload</h1>
            <p className="text-gray-600 mt-1">
              Escolha como você quer gerar a proposta
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Passo 2 de 4</span>
            <span>25% concluído</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-drystore-blue h-2 rounded-full transition-all duration-300" style={{ width: '25%' }}></div>
          </div>
        </div>

        {/* Content */}
        {!selectedType ? (
          <UploadTypeSelector onSelectType={handleTypeSelection} />
        ) : selectedType === 'erp' ? (
          <ERPUploader onUploadComplete={handleERPUploadComplete} />
        ) : null}
      </div>
    </Layout>
  );
};

export default ProposalUploadChoice;
