
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailTestForm } from './email/EmailTestForm';
import { SMTPConfigurationTab } from './email/SMTPConfigurationTab';
import { StatusTab } from './email/StatusTab';
import { NextStepsCard } from './email/NextStepsCard';

const EmailDiagnostic = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [testEmail, setTestEmail] = useState('caroline@drystore.com.br');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔧 Configuração SMTP do Resend</CardTitle>
          <CardDescription>
            Instruções para configurar o SMTP direto do Resend no Supabase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Tabs defaultValue="smtp-config" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="smtp-config">Configuração SMTP</TabsTrigger>
                <TabsTrigger value="tests">Testes</TabsTrigger>
                <TabsTrigger value="status">Status</TabsTrigger>
              </TabsList>

              <TabsContent value="smtp-config" className="space-y-4">
                <SMTPConfigurationTab />
              </TabsContent>

              <TabsContent value="tests" className="space-y-4">
                <EmailTestForm
                  testEmail={testEmail}
                  setTestEmail={setTestEmail}
                  testing={testing}
                  setTesting={setTesting}
                  results={results}
                  setResults={setResults}
                />
              </TabsContent>

              <TabsContent value="status" className="space-y-4">
                <StatusTab />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <NextStepsCard />
    </div>
  );
};

export default EmailDiagnostic;
