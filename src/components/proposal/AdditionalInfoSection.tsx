
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ExtractedData {
  paymentTerms?: string;
}

interface AdditionalInfoSectionProps {
  extractedData: ExtractedData;
  onUpdateData: (field: keyof ExtractedData, value: string) => void;
}

const AdditionalInfoSection = ({ extractedData, onUpdateData }: AdditionalInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Informações Adicionais</h3>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="paymentTerms">Condições de Pagamento</Label>
          <Input
            id="paymentTerms"
            value={extractedData.paymentTerms || ''}
            onChange={(e) => onUpdateData('paymentTerms', e.target.value)}
            placeholder="Ex: 30 dias"
          />
        </div>
      </div>
    </div>
  );
};

export default AdditionalInfoSection;
