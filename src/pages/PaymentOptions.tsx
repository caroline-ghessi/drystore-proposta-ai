
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import PaymentMethodSelector from '@/components/payment/PaymentMethodSelector';
import CreditCardForm from '@/components/payment/CreditCardForm';
import PIXPayment from '@/components/payment/PIXPayment';
import BoletoPayment from '@/components/payment/BoletoPayment';
import { usePaymentProcessing } from '@/hooks/usePaymentProcessing';
import { getMockProposal } from '@/data/mockProposalData';
import { PIXData, BoletoData, CreditCardData } from '@/types/payment';

type PaymentStep = 'select' | 'form' | 'success';

const PaymentOptions = () => {
  const { proposalId } = useParams<{ proposalId: string }>();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [step, setStep] = useState<PaymentStep>('select');
  const [pixData, setPixData] = useState<PIXData | null>(null);
  const [boletoData, setBoletoData] = useState<BoletoData | null>(null);
  const [transactionId, setTransactionId] = useState<string>('');

  const { 
    isProcessing, 
    processCreditCardPayment, 
    generatePIX, 
    generateBoleto 
  } = usePaymentProcessing();

  const proposal = getMockProposal(proposalId || '1');

  const handleMethodSelection = (method: string) => {
    setSelectedMethod(method);
    
    if (method === 'pix') {
      handlePIXGeneration();
    } else if (method === 'boleto') {
      handleBoletoGeneration();
    } else {
      setStep('form');
    }
  };

  const handleCreditCardSubmit = async (cardData: CreditCardData) => {
    const result = await processCreditCardPayment(
      proposalId || '1',
      proposal.finalPrice,
      cardData
    );

    if (result.success) {
      setTransactionId(result.transactionId || '');
      setStep('success');
    }
  };

  const handlePIXGeneration = async () => {
    const result = await generatePIX(proposalId || '1', proposal.finalPrice);
    
    if (result.success && result.data) {
      setPixData(result.data as PIXData);
      setStep('form');
    }
  };

  const handleBoletoGeneration = async () => {
    const result = await generateBoleto(proposalId || '1', proposal.finalPrice);
    
    if (result.success && result.data) {
      setBoletoData(result.data as BoletoData);
      setStep('form');
    }
  };

  const handlePIXPaymentConfirmed = () => {
    setTransactionId(`PIX_${Date.now()}`);
    setStep('success');
  };

  const handleBack = () => {
    if (step === 'form') {
      setStep('select');
      setSelectedMethod(null);
      setPixData(null);
      setBoletoData(null);
    } else {
      navigate(`/proposal/${proposalId}`);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'select':
        return (
          <PaymentMethodSelector
            onSelectMethod={handleMethodSelection}
            selectedMethod={selectedMethod}
          />
        );

      case 'form':
        if (selectedMethod === 'credit_card') {
          return (
            <CreditCardForm
              onSubmit={handleCreditCardSubmit}
              isProcessing={isProcessing}
              onBack={handleBack}
            />
          );
        } else if (selectedMethod === 'pix' && pixData) {
          return (
            <PIXPayment
              pixData={pixData}
              onBack={handleBack}
              onPaymentConfirmed={handlePIXPaymentConfirmed}
            />
          );
        } else if (selectedMethod === 'boleto' && boletoData) {
          return (
            <BoletoPayment
              boletoData={boletoData}
              onBack={handleBack}
            />
          );
        }
        break;

      case 'success':
        return (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-800 mb-2">
                Pagamento Processado!
              </h2>
              <p className="text-gray-600 mb-4">
                {selectedMethod === 'credit_card' 
                  ? `Sua transação ${transactionId} foi aprovada com sucesso.`
                  : 'Aguardando confirmação do pagamento.'
                }
              </p>
              <Button 
                onClick={() => navigate(`/proposal/${proposalId}`)}
                className="w-full"
              >
                Voltar à Proposta
              </Button>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={handleBack} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Pagamento da Proposta</h1>
            <p className="text-gray-600">
              Proposta #{proposalId} - {proposal.clientName}
            </p>
          </div>
        </div>

        {/* Resumo da Proposta */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Resumo do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{proposal.clientName}</p>
                <p className="text-sm text-gray-600">
                  {proposal.solutions?.[0]?.name || 'Proposta Personalizada'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  R$ {proposal.finalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-600">
                  ou {proposal.installments.times}x R$ {proposal.installments.value.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conteúdo Principal */}
        {renderStep()}
      </div>
    </Layout>
  );
};

export default PaymentOptions;
