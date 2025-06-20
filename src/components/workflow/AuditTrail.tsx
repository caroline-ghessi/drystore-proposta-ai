
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FileText, User, Clock, Filter } from 'lucide-react';

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  severity: 'info' | 'warning' | 'error';
}

export const AuditTrail = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState('all');
  const [filterAction, setFilterAction] = useState('all');

  const [auditEntries] = useState<AuditEntry[]>([
    {
      id: '1',
      timestamp: '2024-01-16T11:30:00',
      user: 'Carlos Admin',
      action: 'APPROVED_DISCOUNT',
      entity: 'Proposal',
      entityId: 'PROP-2024-001',
      details: 'Aprovado desconto de 15% para João Silva',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0...',
      severity: 'info'
    },
    {
      id: '2',
      timestamp: '2024-01-16T11:15:00',
      user: 'Maria Vendedora',
      action: 'CREATED_PROPOSAL',
      entity: 'Proposal',
      entityId: 'PROP-2024-008',
      details: 'Nova proposta criada para Empresa XYZ',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0...',
      severity: 'info'
    },
    {
      id: '3',
      timestamp: '2024-01-16T10:45:00',
      user: 'Sistema',
      action: 'AUTO_EXPIRED',
      entity: 'Proposal',
      entityId: 'PROP-2024-005',
      details: 'Proposta expirada automaticamente após 30 dias',
      ipAddress: 'system',
      userAgent: 'system',
      severity: 'warning'
    },
    {
      id: '4',
      timestamp: '2024-01-16T10:30:00',
      user: 'Roberto Manager',
      action: 'REJECTED_CREDIT',
      entity: 'CreditRequest',
      entityId: 'CR-2024-003',
      details: 'Solicitação de crédito rejeitada por alto risco',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0...',
      severity: 'warning'
    },
    {
      id: '5',
      timestamp: '2024-01-16T09:15:00',
      user: 'Ana Representante',
      action: 'LOGIN_FAILED',
      entity: 'User',
      entityId: 'user-456',
      details: 'Tentativa de login falhada - senha incorreta',
      ipAddress: '192.168.1.103',
      userAgent: 'Mozilla/5.0...',
      severity: 'error'
    }
  ]);

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'APPROVED_DISCOUNT':
        return 'Desconto Aprovado';
      case 'CREATED_PROPOSAL':
        return 'Proposta Criada';
      case 'AUTO_EXPIRED':
        return 'Expiração Automática';
      case 'REJECTED_CREDIT':
        return 'Crédito Rejeitado';
      case 'LOGIN_FAILED':
        return 'Login Falhado';
      default:
        return action;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEntries = auditEntries.filter(entry => {
    const matchesSearch = searchTerm === '' || 
      entry.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.entityId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUser = filterUser === 'all' || entry.user === filterUser;
    const matchesAction = filterAction === 'all' || entry.action === filterAction;
    
    return matchesSearch && matchesUser && matchesAction;
  });

  const uniqueUsers = [...new Set(auditEntries.map(entry => entry.user))];
  const uniqueActions = [...new Set(auditEntries.map(entry => entry.action))];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="w-5 h-5 mr-2 text-purple-600" />
          Trilha de Auditoria
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por detalhes, usuário ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterUser} onValueChange={setFilterUser}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por usuário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os usuários</SelectItem>
              {uniqueUsers.map(user => (
                <SelectItem key={user} value={user}>{user}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as ações</SelectItem>
              {uniqueActions.map(action => (
                <SelectItem key={action} value={action}>{getActionLabel(action)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lista de Auditoria */}
        {filteredEntries.length > 0 ? (
          <div className="space-y-3">
            {filteredEntries.map((entry) => (
              <div key={entry.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge className={getSeverityColor(entry.severity)}>
                      {entry.severity.toUpperCase()}
                    </Badge>
                    <span className="font-medium">{getActionLabel(entry.action)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(entry.timestamp).toLocaleString('pt-BR')}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Usuário:</span>
                    <span className="ml-1 font-medium">{entry.user}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Entidade:</span>
                    <span className="ml-1">{entry.entity} ({entry.entityId})</span>
                  </div>
                </div>
                
                <div className="mt-2">
                  <p className="text-sm text-gray-700">{entry.details}</p>
                </div>
                
                <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                  <span>IP: {entry.ipAddress}</span>
                  {entry.userAgent !== 'system' && (
                    <span>User Agent: {entry.userAgent.substring(0, 50)}...</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma entrada de auditoria encontrada</p>
          </div>
        )}

        {/* Ações */}
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Mostrando {filteredEntries.length} de {auditEntries.length} entradas
          </div>
          <div className="space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-1" />
              Filtros Avançados
            </Button>
            <Button variant="outline" size="sm">
              Exportar CSV
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
