
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ProductGroupSelector } from '@/components/proposal/ProductGroupSelector';
import { ProductGroup } from '@/types/productGroups';

const CreateProposal = () => {
  const navigate = useNavigate();

  const handleProductGroupSelect = (productGroup: ProductGroup) => {
    if (productGroup === 'energia_solar') {
      navigate('/create-proposal/energia-solar/input-choice');
    } else {
      navigate(`/create-proposal/upload-choice/${productGroup}`);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nova Proposta</h1>
            <p className="text-gray-600 mt-1">Escolha como deseja criar a proposta</p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Passo 1 de 3</span>
            <span>33% concluído</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-drystore-blue h-2 rounded-full transition-all duration-300" style={{ width: '33%' }}></div>
          </div>
        </div>

        <ProductGroupSelector 
          selectedGroup={null}
          onGroupSelect={handleProductGroupSelect}
        />
      </div>
    </Layout>
  );
};

export default CreateProposal;
