
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, CheckCircle, XCircle, AlertCircle, FileText, Users, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProposalStatusProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
  editable?: boolean;
}

const ProposalStatus = ({ currentStatus, onStatusChange, editable = false }: ProposalStatusProps) => {
  const { toast } = useToast();

  const statusOptions = [
    { value: 'rascunho', label: 'Rascunho', icon: FileText, color: 'bg-gray-100 text-gray-800' },
    { value: 'aguardando_planta', label: 'Aguardando Planta', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'revisao_tecnica', label: 'Revisão Técnica', icon: Settings, color: 'bg-blue-100 text-blue-800' },
    { value: 'aberta', label: 'Em Aberto', icon: Clock, color: 'bg-orange-100 text-orange-800' },
    { value: 'negociacao', label: 'Negociação', icon: Users, color: 'bg-purple-100 text-purple-800' },
    { value: 'aceita', label: 'Aceita', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
    { value: 'negada', label: 'Negada', icon: XCircle, color: 'bg-red-100 text-red-800' },
    { value: 'expirada', label: 'Expirada', icon: AlertCircle, color: 'bg-gray-100 text-gray-800' }
  ];

  const currentStatusInfo = statusOptions.find(status => status.value === currentStatus) || statusOptions[0];
  const Icon = currentStatusInfo.icon;

  const handleStatusChange = (newStatus: string) => {
    onStatusChange(newStatus);
    const newStatusInfo = statusOptions.find(status => status.value === newStatus);
    toast({
      title: "Status atualizado",
      description: `Proposta alterada para "${newStatusInfo?.label}".`,
    });
  };

  if (!editable) {
    return (
      <Badge className={currentStatusInfo.color}>
        <Icon className="w-3 h-3 mr-1" />
        {currentStatusInfo.label}
      </Badge>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">Status:</span>
      <Select value={currentStatus} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-48">
          <SelectValue>
            <div className="flex items-center">
              <Icon className="w-4 h-4 mr-2" />
              {currentStatusInfo.label}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((status) => {
            const StatusIcon = status.icon;
            return (
              <SelectItem key={status.value} value={status.value}>
                <div className="flex items-center">
                  <StatusIcon className="w-4 h-4 mr-2" />
                  {status.label}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProposalStatus;
