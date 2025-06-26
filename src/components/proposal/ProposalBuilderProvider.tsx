
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProductGroup } from '@/types/productGroups';

interface ProposalItem {
  id: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface ClientData {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
}

type ProposalStep = 'product-group' | 'proposal-details';

interface ProposalBuilderContextType {
  // Step management
  currentStep: ProposalStep;
  setCurrentStep: (step: ProposalStep) => void;
  selectedProductGroup: ProductGroup | null;
  setSelectedProductGroup: (group: ProductGroup | null) => void;
  
  // Client data
  clientData: ClientData;
  setClientData: React.Dispatch<React.SetStateAction<ClientData>>;
  updateClientData: (field: keyof ClientData, value: string) => void;
  
  // Items
  items: ProposalItem[];
  setItems: React.Dispatch<React.SetStateAction<ProposalItem[]>>;
  updateItem: (itemId: string, field: string, value: number | string) => void;
  removeItem: (itemId: string) => void;
  addItem: () => void;
  
  // Form state
  observations: string;
  setObservations: (value: string) => void;
  validityDays: number;
  setValidityDays: (value: number) => void;
  discount: number;
  setDiscount: (value: number) => void;
  selectedPaymentConditions: string[];
  setSelectedPaymentConditions: (conditions: string[]) => void;
  errors: {[key: string]: string};
  setErrors: React.Dispatch<React.SetStateAction<{[key: string]: string}>>;
  
  // New features
  includeVideo: boolean;
  setIncludeVideo: (value: boolean) => void;
  videoUrl: string;
  setVideoUrl: (value: string) => void;
  includeTechnicalDetails: boolean;
  setIncludeTechnicalDetails: (value: boolean) => void;
  selectedSolutions: Array<{ solutionId: string; value: number }>;
  setSelectedSolutions: (solutions: Array<{ solutionId: string; value: number }>) => void;
  selectedRecommendedProducts: string[];
  setSelectedRecommendedProducts: (products: string[]) => void;
  showDetailedValues: boolean;
  setShowDetailedValues: (value: boolean) => void;
  
  // Calculated values
  subtotal: number;
  discountAmount: number;
  finalTotal: number;
}

const ProposalBuilderContext = createContext<ProposalBuilderContextType | undefined>(undefined);

export const useProposalBuilder = () => {
  const context = useContext(ProposalBuilderContext);
  if (!context) {
    throw new Error('useProposalBuilder must be used within a ProposalBuilderProvider');
  }
  return context;
};

export const ProposalBuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Step management
  const [currentStep, setCurrentStep] = useState<ProposalStep>('product-group');
  const [selectedProductGroup, setSelectedProductGroup] = useState<ProductGroup | null>(null);
  
  // Client data
  const [clientData, setClientData] = useState<ClientData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: ''
  });

  // Items
  const [items, setItems] = useState<ProposalItem[]>([]);
  
  // Form state
  const [observations, setObservations] = useState('');
  const [validityDays, setValidityDays] = useState(15);
  const [discount, setDiscount] = useState(0);
  const [selectedPaymentConditions, setSelectedPaymentConditions] = useState<string[]>([]);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // New features
  const [includeVideo, setIncludeVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [includeTechnicalDetails, setIncludeTechnicalDetails] = useState(false);
  const [selectedSolutions, setSelectedSolutions] = useState<Array<{ solutionId: string; value: number }>>([]);
  const [selectedRecommendedProducts, setSelectedRecommendedProducts] = useState<string[]>([]);
  const [showDetailedValues, setShowDetailedValues] = useState(true);

  // Load extracted data on mount
  useEffect(() => {
    const extractedDataStr = sessionStorage.getItem('proposalExtractedData');
    if (extractedDataStr) {
      const extractedData = JSON.parse(extractedDataStr);
      
      console.log('📋 Dados carregados no ProposalBuilder:', extractedData);
      
      // Map client data
      setClientData({
        name: extractedData.client || '',
        email: extractedData.clientEmail || '',
        phone: '',
        company: extractedData.vendor || '',
        address: ''
      });

      // Map items
      const mappedItems = extractedData.items.map((item: any, index: number) => ({
        id: String(index + 1),
        category: 'Material',
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        total: item.total
      }));
      setItems(mappedItems);

      // Map observations
      if (extractedData.paymentTerms || extractedData.delivery) {
        const obs = [];
        if (extractedData.paymentTerms) obs.push(`Condições: ${extractedData.paymentTerms}`);
        if (extractedData.delivery) obs.push(`Entrega: ${extractedData.delivery}`);
        setObservations(obs.join('\n'));
      }

      // If data is loaded, skip to second step
      if (extractedData.items && extractedData.items.length > 0) {
        setCurrentStep('proposal-details');
      }
    }
  }, []);

  const updateClientData = (field: keyof ClientData, value: string) => {
    setClientData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateItem = (itemId: string, field: string, value: number | string) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const addItem = () => {
    const newItem: ProposalItem = {
      id: String(Date.now()),
      category: 'Material',
      description: 'Novo item',
      quantity: 1,
      unit: 'un',
      unitPrice: 0,
      total: 0
    };
    setItems(prev => [...prev, newItem]);
  };

  // Calculated values
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (subtotal * discount) / 100;
  const finalTotal = subtotal - discountAmount;

  const value: ProposalBuilderContextType = {
    // Step management
    currentStep,
    setCurrentStep,
    selectedProductGroup,
    setSelectedProductGroup,
    
    // Client data
    clientData,
    setClientData,
    updateClientData,
    
    // Items
    items,
    setItems,
    updateItem,
    removeItem,
    addItem,
    
    // Form state
    observations,
    setObservations,
    validityDays,
    setValidityDays,
    discount,
    setDiscount,
    selectedPaymentConditions,
    setSelectedPaymentConditions,
    errors,
    setErrors,
    
    // New features
    includeVideo,
    setIncludeVideo,
    videoUrl,
    setVideoUrl,
    includeTechnicalDetails,
    setIncludeTechnicalDetails,
    selectedSolutions,
    setSelectedSolutions,
    selectedRecommendedProducts,
    setSelectedRecommendedProducts,
    showDetailedValues,
    setShowDetailedValues,
    
    // Calculated values
    subtotal,
    discountAmount,
    finalTotal
  };

  return (
    <ProposalBuilderContext.Provider value={value}>
      {children}
    </ProposalBuilderContext.Provider>
  );
};
