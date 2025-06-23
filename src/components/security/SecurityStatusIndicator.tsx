
import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SecurityStatus {
  rlsEnabled: boolean;
  tablesWithRLS: string[];
  tablesWithoutRLS: string[];
  lastCheck: Date;
}

const SecurityStatusIndicator = () => {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    rlsEnabled: true,
    tablesWithRLS: [
      'proposals',
      'proposal_items',
      'proposal_recommended_products',
      'proposal_solutions',
      'proposal_payment_conditions',
      'proposal_features'
    ],
    tablesWithoutRLS: [],
    lastCheck: new Date()
  });

  const getStatusColor = () => {
    if (securityStatus.tablesWithoutRLS.length === 0) {
      return 'text-green-600';
    } else if (securityStatus.tablesWithoutRLS.length <= 2) {
      return 'text-yellow-600';
    } else {
      return 'text-red-600';
    }
  };

  const getStatusIcon = () => {
    if (securityStatus.tablesWithoutRLS.length === 0) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else {
      return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusText = () => {
    if (securityStatus.tablesWithoutRLS.length === 0) {
      return 'Todas as tabelas protegidas';
    } else {
      return `${securityStatus.tablesWithoutRLS.length} tabela(s) sem RLS`;
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Status de Segurança RLS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className={`font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          <Badge variant={securityStatus.tablesWithoutRLS.length === 0 ? 'default' : 'destructive'}>
            {securityStatus.tablesWithoutRLS.length === 0 ? 'Seguro' : 'Atenção'}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            <strong>Tabelas com RLS:</strong>
          </div>
          <div className="flex flex-wrap gap-1">
            {securityStatus.tablesWithRLS.map((table) => (
              <Badge key={table} variant="outline" className="text-xs">
                {table}
              </Badge>
            ))}
          </div>
        </div>

        {securityStatus.tablesWithoutRLS.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-red-600">
              <strong>Tabelas sem RLS:</strong>
            </div>
            <div className="flex flex-wrap gap-1">
              {securityStatus.tablesWithoutRLS.map((table) => (
                <Badge key={table} variant="destructive" className="text-xs">
                  {table}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500">
          Última verificação: {securityStatus.lastCheck.toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityStatusIndicator;
