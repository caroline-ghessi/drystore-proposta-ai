import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export const InfrastructureTest = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const testInfrastructure = async () => {
    setTesting(true);
    setResult(null);
    
    try {
      console.log('🔧 Iniciando teste de infraestrutura...');
      
      const { data, error } = await supabase.functions.invoke('test-infrastructure', {
        body: { test: 'basic' }
      });

      if (error) {
        console.error('❌ Erro no teste de infraestrutura:', error);
        setResult({ error: error.message, status: 'failed' });
        toast({
          title: "Erro no Teste",
          description: `Falha: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Teste de infraestrutura bem-sucedido:', data);
      setResult(data);
      toast({
        title: "Teste Bem-sucedido",
        description: "Infraestrutura básica funcionando",
        variant: "default",
      });

    } catch (error) {
      console.error('🚨 Erro crítico no teste:', error);
      setResult({ error: error.message, status: 'critical_failure' });
      toast({
        title: "Erro Crítico",
        description: `Falha crítica: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Teste de Infraestrutura Básica</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testInfrastructure} 
          disabled={testing}
          className="w-full"
        >
          {testing ? 'Testando...' : 'Testar Infraestrutura'}
        </Button>

        {result && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Resultado do Teste:</h4>
            <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};