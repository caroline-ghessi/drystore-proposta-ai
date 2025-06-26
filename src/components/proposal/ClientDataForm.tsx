
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, Building } from 'lucide-react';
import { useProposalBuilder } from './ProposalBuilderProvider';

export const ClientDataForm: React.FC = () => {
  const { clientData, updateClientData, errors } = useProposalBuilder();

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="w-5 h-5 mr-2 text-drystore-blue" />
          Dados do Cliente
        </CardTitle>
        <CardDescription>
          Confirme e complete as informações do cliente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">
              Nome *
              {errors.name && (
                <span className="text-red-500 text-sm ml-1">({errors.name})</span>
              )}
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="clientName"
                value={clientData.name}
                onChange={(e) => updateClientData('name', e.target.value)}
                className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Nome do cliente"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="clientEmail">
              Email *
              {errors.email && (
                <span className="text-red-500 text-sm ml-1">({errors.email})</span>
              )}
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="clientEmail"
                type="email"
                value={clientData.email}
                onChange={(e) => updateClientData('email', e.target.value)}
                className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="clientPhone">Telefone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="clientPhone"
                value={clientData.phone}
                onChange={(e) => updateClientData('phone', e.target.value)}
                className="pl-10"
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="clientCompany">Empresa</Label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="clientCompany"
                value={clientData.company}
                onChange={(e) => updateClientData('company', e.target.value)}
                className="pl-10"
                placeholder="Nome da empresa"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <Label htmlFor="clientAddress">Endereço</Label>
          <Input
            id="clientAddress"
            value={clientData.address}
            onChange={(e) => updateClientData('address', e.target.value)}
            placeholder="Endereço completo"
          />
        </div>
      </CardContent>
    </Card>
  );
};
