
import Layout from '@/components/Layout';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const handleUploadComplete = (data: ExtractedData) => {
    setExtractedData(data);
    setShowReviewModal(true);
  };

  const handleDataConfirmed = (finalData: ExtractedData) => {
    // Armazena os dados finais e vai para o builder
    sessionStorage.setItem('proposalExtractedData', JSON.stringify(finalData));
    setShowReviewModal(false);
    navigate('/proposal-builder');
  };

  return (
    <Layout backPath="/create-proposal">
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Upload de PDF</h1>
            <p className="text-gray-600 mt-1">
              Envie o PDF com quantitativos para gerar a proposta automaticamente
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Passo 2 de 4</span>
            <span>50% concluído</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-drystore-blue h-2 rounded-full transition-all duration-300" style={{ width: '50%' }}></div>
          </div>
        </div>

        {/* Upload Component */}
        <RealERPUploader onUploadComplete={handleUploadComplete} />

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
