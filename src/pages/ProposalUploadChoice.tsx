
import Layout from '@/components/Layout';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadTypeSelector from '@/components/proposal/UploadTypeSelector';
import RealERPUploader from '@/components/proposal/RealERPUploader';
import PDFDataReviewModal from '@/components/proposal/PDFDataReviewModal';

interface ExtractedData {
  id?: string;
  client?: string;
  items: Array<{
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  total: number;
  paymentTerms?: string;
  delivery?: string;
  vendor?: string;
}

const ProposalUploadChoice = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<'architectural' | 'erp' | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const handleTypeSelection = (type: 'architectural' | 'erp') => {
    setSelectedType(type);
    
    if (type === 'architectural') {
      // Redireciona para o upload de documento arquitetônico existente
      navigate('/upload-document');
    }
  };

  const handleERPUploadComplete = (data: ExtractedData) => {
    setExtractedData(data);
    setShowReviewModal(true);
  };

  const handleDataConfirmed = (finalData: ExtractedData) => {
    // Armazena os dados finais e vai para edição/preview
    sessionStorage.setItem('erpProposalData', JSON.stringify(finalData));
    setShowReviewModal(false);
    navigate('/edit-proposal');
  };

  return (
    <Layout backPath="/create-proposal">
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mb-8">
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
          <RealERPUploader onUploadComplete={handleERPUploadComplete} />
        ) : null}

        {/* Modal de Revisão */}
        {extractedData && (
          <PDFDataReviewModal
            open={showReviewModal}
            onOpenChange={setShowReviewModal}
            extractedData={extractedData}
            onConfirm={handleDataConfirmed}
          />
        )}
      </div>
    </Layout>
  );
};

export default ProposalUploadChoice;
