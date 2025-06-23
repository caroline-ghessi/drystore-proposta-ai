
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import SecurityStatusIndicator from './SecurityStatusIndicator';

const SecurityAuditPanel = () => {
  const recentFixes = [
    {
      table: 'proposal_recommended_products',
      action: 'RLS habilitado',
      timestamp: new Date(),
      status: 'completed'
    },
    {
      table: 'proposal_solutions',
      action: 'RLS habilitado',
      timestamp: new Date(),
      status: 'completed'
    },
    {
      table: 'proposal_recommended_products',
      action: 'Políticas RLS criadas',
      timestamp: new Date(),
      status: 'completed'
    },
    {
      table: 'proposal_solutions',
      action: 'Políticas RLS criadas',
      timestamp: new Date(),
      status: 'completed'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SecurityStatusIndicator />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Correções Recentes
            </CardTitle>
            <CardDescription>
              Alterações de segurança aplicadas recentemente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentFixes.map((fix, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium text-sm">{fix.table}</div>
                    <div className="text-xs text-gray-600">{fix.action}</div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant="outline" className="text-xs">
                      {fix.status === 'completed' ? 'Concluído' : 'Pendente'}
                    </Badge>
                    <div className="text-xs text-gray-500">
                      {fix.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Políticas de Segurança Aplicadas
          </CardTitle>
          <CardDescription>
            Resumo das políticas RLS implementadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Tabela: proposal_recommended_products</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">RLS habilitado</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Política de visualização</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Política de inserção</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Política de atualização</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Política de exclusão</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Tabela: proposal_solutions</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">RLS habilitado</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Política de visualização</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Política de inserção</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Política de atualização</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Política de exclusão</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityAuditPanel;
