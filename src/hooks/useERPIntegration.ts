
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ERPOrder, XMLOrderData } from '@/types/erp';

export const useERPIntegration = () => {
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isGeneratingXML, setIsGeneratingXML] = useState(false);
  const { toast } = useToast();

  const createERPOrder = async (proposalData: any): Promise<ERPOrder> => {
    setIsCreatingOrder(true);
    
    try {
      console.log('Criando pedido no ERP para proposta:', proposalData.id);
      
      // Aqui será feita a integração real com ERP via Supabase Edge Function
      // Por enquanto, simular a criação
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const erpOrder: ERPOrder = {
        id: Date.now().toString(),
        proposalId: proposalData.id,
        clientId: proposalData.clientId,
        orderNumber: `PED-${Date.now()}`,
        items: proposalData.items.map((item: any) => ({
          id: item.id,
          productCode: item.code || item.id,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
          description: item.description
        })),
        totalValue: proposalData.finalPrice,
        status: 'created',
        createdAt: new Date().toISOString(),
        erpOrderId: `ERP_${Date.now()}`,
        invoiceId: `INV_${Date.now()}`,
        separationOrderId: `SEP_${Date.now()}`
      };

      // Salvar no localStorage temporariamente
      const existingOrders = JSON.parse(localStorage.getItem('erp_orders') || '[]');
      existingOrders.push(erpOrder);
      localStorage.setItem('erp_orders', JSON.stringify(existingOrders));

      toast({
        title: "Pedido ERP Criado!",
        description: `Pedido ${erpOrder.orderNumber} criado com sucesso no ERP`,
      });

      return erpOrder;
    } catch (error) {
      console.error('Erro ao criar pedido no ERP:', error);
      toast({
        title: "Erro no ERP",
        description: "Não foi possível criar o pedido no ERP",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const generateOrderXML = async (orderData: XMLOrderData): Promise<string> => {
    setIsGeneratingXML(true);
    
    try {
      console.log('Gerando XML do pedido:', orderData.order.id);
      
      // Aqui será chamada a Edge Function para gerar XML real
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Template XML simulado
      const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<pedido>
  <numero>${orderData.order.orderNumber}</numero>
  <data>${new Date().toISOString()}</data>
  <cliente>
    <nome>${orderData.client.name}</nome>
    <documento>${orderData.client.document}</documento>
    <email>${orderData.client.email}</email>
    <telefone>${orderData.client.phone}</telefone>
  </cliente>
  <itens>
    ${orderData.order.items.map(item => `
    <item>
      <codigo>${item.productCode}</codigo>
      <nome>${item.productName}</nome>
      <quantidade>${item.quantity}</quantidade>
      <preco_unitario>${item.unitPrice}</preco_unitario>
      <preco_total>${item.totalPrice}</preco_total>
    </item>`).join('')}
  </itens>
  <total>${orderData.order.totalValue}</total>
</pedido>`;

      // Salvar XML no localStorage (em produção seria salvo no Supabase Storage)
      const xmls = JSON.parse(localStorage.getItem('generated_xmls') || '{}');
      xmls[orderData.order.id] = xmlContent;
      localStorage.setItem('generated_xmls', JSON.stringify(xmls));

      toast({
        title: "XML Gerado!",
        description: `XML do pedido ${orderData.order.orderNumber} gerado com sucesso`,
      });

      return xmlContent;
    } catch (error) {
      console.error('Erro ao gerar XML:', error);
      toast({
        title: "Erro na Geração XML",
        description: "Não foi possível gerar o XML do pedido",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsGeneratingXML(false);
    }
  };

  const getERPOrders = (): ERPOrder[] => {
    return JSON.parse(localStorage.getItem('erp_orders') || '[]');
  };

  const getGeneratedXML = (orderId: string): string | null => {
    const xmls = JSON.parse(localStorage.getItem('generated_xmls') || '{}');
    return xmls[orderId] || null;
  };

  return {
    createERPOrder,
    generateOrderXML,
    getERPOrders,
    getGeneratedXML,
    isCreatingOrder,
    isGeneratingXML
  };
};
