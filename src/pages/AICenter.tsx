
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatBot } from '@/components/ai/ChatBot';
import { SentimentAnalysis } from '@/components/ai/SentimentAnalysis';
import { DynamicPricing } from '@/components/ai/DynamicPricing';
import { FraudDetection } from '@/components/ai/FraudDetection';

const AICenter = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Centro de IA</h1>
          <p className="text-gray-600">Recursos inteligentes para otimizar suas vendas</p>
        </div>

        <Tabs defaultValue="chatbot" className="space-y-4">
          <TabsList>
            <TabsTrigger value="chatbot">Chatbot 24/7</TabsTrigger>
            <TabsTrigger value="sentiment">Análise de Sentimento</TabsTrigger>
            <TabsTrigger value="pricing">Precificação Dinâmica</TabsTrigger>
            <TabsTrigger value="fraud">Detecção de Riscos</TabsTrigger>
          </TabsList>

          <TabsContent value="chatbot">
            <ChatBot />
          </TabsContent>

          <TabsContent value="sentiment">
            <SentimentAnalysis />
          </TabsContent>

          <TabsContent value="pricing">
            <DynamicPricing />
          </TabsContent>

          <TabsContent value="fraud">
            <FraudDetection />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AICenter;
