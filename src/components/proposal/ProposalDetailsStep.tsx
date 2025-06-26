
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Eye } from 'lucide-react';
import { ClientDataForm } from './ClientDataForm';
import VideoConfigSection from './VideoConfigSection';
import RecommendedProductSelector from './RecommendedProductSelector';
import SolutionSelector from './SolutionSelector';
import { ProposalItemsManager } from './ProposalItemsManager';
import DiscountSection from './DiscountSection';
import { ProposalFinancialSummary } from './ProposalFinancialSummary';
import PaymentConditionsSelector from './PaymentConditionsSelector';
import { useProposalBuilder } from './ProposalBuilderProvider';

export const ProposalDetailsStep: React.FC = () => {
  const {
    // Items
    items,
    updateItem,
    removeItem,
    addItem,
    showDetailedValues,
    setShowDetailedValues,
    
    // Video
    includeVideo,
    setIncludeVideo,
    videoUrl,
    setVideoUrl,
    
    // Recommended products
    selectedRecommendedProducts,
    setSelectedRecommendedProducts,
    
    // Solutions
    includeTechnicalDetails,
    setIncludeTechnicalDetails,
    selectedSolutions,
    setSelectedSolutions,
    
    // Discount
    discount,
    setDiscount,
    subtotal,
    
    // Observations
    observations,
    setObservations,
    
    // Financial
    validityDays,
    setValidityDays,
    finalTotal,
    
    // Payment conditions
    selectedPaymentConditions,
    setSelectedPaymentConditions,
    
    // Errors
    errors
  } = useProposalBuilder();

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Client Data */}
        <ClientDataForm />

        {/* Video Configuration */}
        <VideoConfigSection
          includeVideo={includeVideo}
          onIncludeVideoChange={setIncludeVideo}
          videoUrl={videoUrl}
          onVideoUrlChange={setVideoUrl}
        />

        {errors.videoUrl && (
          <div className="flex items-center gap-2 p-3 border border-red-200 bg-red-50 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-red-700 text-sm">{errors.videoUrl}</span>
          </div>
        )}

        {/* Recommended Products */}
        <RecommendedProductSelector
          selectedProducts={selectedRecommendedProducts}
          onSelectedProductsChange={setSelectedRecommendedProducts}
        />

        {/* Technical Solutions */}
        <SolutionSelector
          includeTechnicalDetails={includeTechnicalDetails}
          onIncludeTechnicalDetailsChange={setIncludeTechnicalDetails}
          selectedSolutions={selectedSolutions}
          onSelectedSolutionsChange={setSelectedSolutions}
        />

        {errors.solutions && (
          <div className="flex items-center gap-2 p-3 border border-red-200 bg-red-50 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-red-700 text-sm">{errors.solutions}</span>
          </div>
        )}

        {/* Items List with Toggle */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Material</CardTitle>
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-gray-500" />
                <Label htmlFor="detailed-values" className="text-sm">
                  Mostrar valores discriminados
                </Label>
                <Switch
                  id="detailed-values"
                  checked={showDetailedValues}
                  onCheckedChange={setShowDetailedValues}
                />
              </div>
            </div>
            <CardDescription>
              {showDetailedValues 
                ? "Exibindo quantidades e preços unitários detalhados"
                : "Exibindo apenas descrição e valor total por item"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProposalItemsManager
              items={items}
              onUpdateItem={updateItem}
              onRemoveItem={removeItem}
              onAddItem={addItem}
              error={errors.items}
              showDetailedValues={showDetailedValues}
            />
          </CardContent>
        </Card>

        {/* Discount Section */}
        <DiscountSection
          discount={discount}
          onDiscountChange={setDiscount}
          subtotal={subtotal}
        />

        {/* Observations */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Observações e Condições</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={4}
              placeholder="Condições comerciais, prazos, garantias..."
            />
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className="sticky top-8 space-y-6">
          {/* Financial Summary */}
          <ProposalFinancialSummary
            subtotal={subtotal}
            discount={discount}
            validityDays={validityDays}
            onValidityDaysChange={setValidityDays}
          />

          {/* Payment Conditions */}
          <PaymentConditionsSelector
            selectedConditions={selectedPaymentConditions}
            onConditionsChange={setSelectedPaymentConditions}
            subtotal={finalTotal}
          />

          {errors.paymentConditions && (
            <div className="flex items-center gap-2 p-3 border border-red-200 bg-red-50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-700 text-sm">{errors.paymentConditions}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
