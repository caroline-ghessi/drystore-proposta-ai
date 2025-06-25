
import { CheckCircle } from 'lucide-react';

export const QualityAssuranceSection = () => {
  return (
    <div className="mt-12 text-center">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex justify-center items-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
          <h4 className="text-xl font-semibold text-green-800">
            Projeto Aprovado por Engenheiro Responsável
          </h4>
        </div>
        <p className="text-green-700">
          Esta solução foi desenvolvida e validada por nossa equipe técnica especializada, 
          seguindo todas as normas ABNT aplicáveis e melhores práticas da engenharia.
        </p>
        <div className="flex justify-center mt-4 space-x-4 text-sm text-green-600">
          <span>✓ ABNT NBR 11370</span>
          <span>✓ NR-11 Compliance</span>
          <span>✓ ISO 9001:2015</span>
        </div>
      </div>
    </div>
  );
};
