
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Search, Download, Filter } from 'lucide-react';
import { WhatsAppMessageHistory } from '@/types/followup';
import { useWhatsAppAPI } from '@/hooks/useWhatsAppAPI';

const WhatsAppHistory = () => {
  const [history, setHistory] = useState<WhatsAppMessageHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<WhatsAppMessageHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { getMessageHistory } = useWhatsAppAPI();

  useEffect(() => {
    const loadHistory = () => {
      const messages = getMessageHistory();
      setHistory(messages.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()));
    };

    loadHistory();
    // Refresh a cada 30 segundos
    const interval = setInterval(loadHistory, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = history;

    if (searchTerm) {
      filtered = filtered.filter(msg =>
        msg.clientPhone.includes(searchTerm) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(msg => msg.status === statusFilter);
    }

    setFilteredHistory(filtered);
  }, [history, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    const colors = {
      sent: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      read: 'bg-emerald-100 text-emerald-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      sent: 'Enviado',
      delivered: 'Entregue',
      read: 'Lido',
      failed: 'Falhou'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const exportHistory = () => {
    const csvContent = [
      ['Data', 'Cliente', 'Vendedor', 'Mensagem', 'Status'],
      ...filteredHistory.map(msg => [
        new Date(msg.sentAt).toLocaleString('pt-BR'),
        msg.clientPhone,
        msg.vendorPhone,
        msg.message.replace(/\n/g, ' '),
        getStatusLabel(msg.status)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'whatsapp-history.csv';
    a.click();
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <MessageCircle className="w-5 h-5 mr-2 text-green-600" />
            Histórico de Mensagens WhatsApp
          </CardTitle>
          <Button onClick={exportHistory} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="flex space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Buscar por telefone ou mensagem..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">Todos os status</option>
            <option value="sent">Enviado</option>
            <option value="delivered">Entregue</option>
            <option value="read">Lido</option>
            <option value="failed">Falhou</option>
          </select>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-4 gap-4 py-4 border-y">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{history.length}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {history.filter(m => m.status === 'delivered').length}
            </p>
            <p className="text-sm text-gray-600">Entregues</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {history.filter(m => m.status === 'read').length}
            </p>
            <p className="text-sm text-gray-600">Lidas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {history.filter(m => m.status === 'failed').length}
            </p>
            <p className="text-sm text-gray-600">Falharam</p>
          </div>
        </div>

        {/* Tabela de Histórico */}
        <div className="overflow-auto max-h-96">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Mensagem</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.map((msg) => (
                <TableRow key={msg.id}>
                  <TableCell className="text-sm">
                    {new Date(msg.sentAt).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell className="font-medium">
                    {msg.clientPhone}
                  </TableCell>
                  <TableCell>
                    {msg.vendorPhone}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={msg.message}>
                      {msg.message.substring(0, 50)}...
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(msg.status)}>
                      {getStatusLabel(msg.status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredHistory.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma mensagem encontrada</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WhatsAppHistory;
