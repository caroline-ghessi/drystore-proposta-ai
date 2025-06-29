
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Calculator, Palette } from 'lucide-react';
import { ProductGroupOption } from '@/types/productGroups';
import { ProposalLayoutService } from '@/services/proposalLayoutService';

interface LayoutPreviewCardProps {
  productGroup: ProductGroupOption;
  onViewLayout: (groupId: string) => void;
}

const LayoutPreviewCard: React.FC<LayoutPreviewCardProps> = ({ 
  productGroup, 
  onViewLayout 
}) => {
  const config = ProposalLayoutService.getLayoutConfig(productGroup.id);
  
  const handlePreview = () => {
    onViewLayout(productGroup.id);
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg border-2 ${productGroup.color}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{productGroup.icon}</div>
            <div>
              <CardTitle className="text-lg font-semibold">
                {productGroup.name}
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                {productGroup.description}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Layout Configuration Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Título Hero:</span>
            <span className="font-medium text-right text-xs max-w-32 truncate" title={config.heroTitle}>
              {config.heroTitle}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center">
              <Palette className="w-3 h-3 mr-1" />
              Cor Primária:
            </span>
            <Badge variant="outline" className="text-xs">
              {config.primaryColor}
            </Badge>
          </div>

          {config.showCalculator && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 flex items-center">
                <Calculator className="w-3 h-3 mr-1" />
                Calculadora:
              </span>
              <Badge variant="secondary" className="text-xs">
                {config.calculatorType}
              </Badge>
            </div>
          )}
        </div>

        {/* Focus Areas */}
        <div>
          <span className="text-sm text-gray-600 block mb-2">Áreas de Foco:</span>
          <div className="flex flex-wrap gap-1">
            {config.focusAreas.map((area, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {area}
              </Badge>
            ))}
          </div>
        </div>

        {/* Subtitle Preview */}
        <div className="bg-gray-50 p-2 rounded text-xs text-gray-700 italic">
          "{config.heroSubtitle}"
        </div>

        {/* Action Button */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handlePreview}
          className="w-full mt-4"
        >
          <Eye className="w-4 h-4 mr-2" />
          Visualizar Layout Completo
        </Button>
      </CardContent>
    </Card>
  );
};

export default LayoutPreviewCard;
