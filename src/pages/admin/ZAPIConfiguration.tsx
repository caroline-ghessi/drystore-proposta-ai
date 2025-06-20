
import Layout from '@/components/Layout';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Save, X, Phone, Key, User } from 'lucide-react';

interface ZAPIConfig {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  token: string;
  instanceId: string;
  phoneNumber: string;
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
}

const ZAPIConfiguration = () => {
  const [configs, setConfigs] = useState<ZAPIConfig[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    vendorName: '',
    vendorEmail: '',
    token: '',
    instanceId: '',
    phoneNumber: ''
  });
  const { toast } = useToast();

  // Simular dados mockados - em produção viria da API
  useEffect(() => {
    const mockConfigs: ZAPIConfig[] = [
      {
        id: '1',
        vendorId: 'v1',
        vendorName: 'João Silva',
        vendorEmail: 'joao@drystore.com.br',
        token: 'zapi_token_123...***',
        instanceId: 'inst_456',
        phoneNumber: '5511999999999',
        isActive: true,
        createdAt: '2024-01-15',
        lastUsed: '2024-06-19'
      },
      {
        id: '2',
        vendorId: 'v2',
        vendorName: 'Maria Santos',
        vendorEmail: 'maria@drystore.com.br',
        token: 'zapi_token_789...***',
        instanceId: 'inst_012',
        phoneNumber: '5511888888888',
        isActive: true,
        createdAt: '2024-02-10',
        lastUsed: '2024-06-18'
      },
      {
        id: '3',
        vendorId: 'v3',
        vendorName: 'Carlos Oliveira',
        vendorEmail: 'carlos@drystore.com.br',
        token: '',
        instanceId: '',
        phoneNumber: '',
        isActive: false,
        createdAt: '2024-03-05'
      }
    ];
    setConfigs(mockConfigs);
  }, []);

  const handleSave = (configId?: string) => {
    if (!formData.vendorName || !formData.vendorEmail) {
      toast({
        title: "Erro",
        description: "Nome e email do vendedor são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (configId) {
      // Editar configuração existente
      setConfigs(prev => prev.map(config => 
        config.id === configId 
          ? { ...config, ...formData }
          : config
      ));
      setEditingId(null);
      toast({
        title: "Configuração Atualizada",
        description: `Z-API do ${formData.vendorName} foi atualizada com sucesso`
      });
    } else {
      // Adicionar nova configuração
      const newConfig: ZAPIConfig = {
        id: Date.now().toString(),
        vendorId: `v${Date.now()}`,
        ...formData,
        isActive: !!(formData.token && formData.instanceId),
        createdAt: new Date().toISOString().split('T')[0]
      };
      setConfigs(prev => [...prev, newConfig]);
      setIsAdding(false);
      toast({
        title: "Vendedor Adicionado",
        description: `Configuração Z-API para ${formData.vendorName} foi criada`
      });
    }

    setFormData({
      vendorName: '',
      vendorEmail: '',
      token: '',
      instanceId: '',
      phoneNumber: ''
    });
  };

  const handleEdit = (config: ZAPIConfig) => {
    setFormData({
      vendorName: config.vendorName,
      vendorEmail: config.vendorEmail,
      token: config.token,
      instanceId: config.instanceId,
      phoneNumber: config.phoneNumber
    });
    setEditingId(config.id);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({
      vendorName: '',
      vendorEmail: '',
      token: '',
      instanceId: '',
      phoneNumber: ''
    });
  };

  const toggleActive = (configId: string) => {
    setConfigs(prev => prev.map(config =>
      config.id === configId
        ? { ...config, isActive: !config.isActive }
        : config
    ));
  };

  const maskToken = (token: string) => {
    if (!token) return 'Não configurado';
    if (token.length <= 8) return token;
    return token.substring(0, 8) + '***';
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Configurações Z-API
            </h1>
            <p className="text-gray-600">
              Gerencie as configurações Z-API para WhatsApp de todos os vendedores
            </p>
          </div>
          <Button 
            onClick={() => setIsAdding(true)}
            className="gradient-bg hover:opacity-90 mt-4 sm:mt-0"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Vendedor
          </Button>
        </div>

        {/* Formulário para adicionar novo vendedor */}
        {isAdding && (
          <Card className="mb-6 border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Novo Vendedor - Configuração Z-API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vendorName">Nome do Vendedor</Label>
                  <Input
                    id="vendorName"
                    value={formData.vendorName}
                    onChange={(e) => setFormData({...formData, vendorName: e.target.value})}
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="vendorEmail">Email do Vendedor</Label>
                  <Input
                    id="vendorEmail"
                    type="email"
                    value={formData.vendorEmail}
                    onChange={(e) => setFormData({...formData, vendorEmail: e.target.value})}
                    placeholder="email@drystore.com.br"
                  />
                </div>
                <div>
                  <Label htmlFor="token">Token Z-API</Label>
                  <Input
                    id="token"
                    type="password"
                    value={formData.token}
                    onChange={(e) => setFormData({...formData, token: e.target.value})}
                    placeholder="Token fornecido pela Z-API"
                  />
                </div>
                <div>
                  <Label htmlFor="instanceId">Instance ID</Label>
                  <Input
                    id="instanceId"
                    value={formData.instanceId}
                    onChange={(e) => setFormData({...formData, instanceId: e.target.value})}
                    placeholder="ID da instância Z-API"
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Número WhatsApp</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    placeholder="5511999999999"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={() => handleSave()}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de configurações */}
        <div className="space-y-4">
          {configs.map((config) => (
            <Card key={config.id} className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{config.vendorName}</CardTitle>
                      <CardDescription>{config.vendorEmail}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={config.isActive ? "default" : "secondary"}>
                      {config.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(config)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editingId === config.id ? (
                  // Formulário de edição
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`token-${config.id}`}>Token Z-API</Label>
                        <Input
                          id={`token-${config.id}`}
                          type="password"
                          value={formData.token}
                          onChange={(e) => setFormData({...formData, token: e.target.value})}
                          placeholder="Token fornecido pela Z-API"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`instance-${config.id}`}>Instance ID</Label>
                        <Input
                          id={`instance-${config.id}`}
                          value={formData.instanceId}
                          onChange={(e) => setFormData({...formData, instanceId: e.target.value})}
                          placeholder="ID da instância Z-API"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`phone-${config.id}`}>Número WhatsApp</Label>
                        <Input
                          id={`phone-${config.id}`}
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                          placeholder="5511999999999"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={() => handleSave(config.id)}>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                      </Button>
                      <Button variant="outline" onClick={handleCancel}>
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Visualização das configurações
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center mb-1">
                        <Key className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Token</span>
                      </div>
                      <p className="text-sm text-gray-600">{maskToken(config.token)}</p>
                    </div>
                    <div>
                      <div className="flex items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">Instance ID</span>
                      </div>
                      <p className="text-sm text-gray-600">{config.instanceId || 'Não configurado'}</p>
                    </div>
                    <div>
                      <div className="flex items-center mb-1">
                        <Phone className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">WhatsApp</span>
                      </div>
                      <p className="text-sm text-gray-600">{config.phoneNumber || 'Não configurado'}</p>
                    </div>
                  </div>
                )}
                
                <Separator className="my-4" />
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Criado em: {config.createdAt}</span>
                  {config.lastUsed && (
                    <span>Último uso: {config.lastUsed}</span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleActive(config.id)}
                  >
                    {config.isActive ? 'Desativar' : 'Ativar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {configs.length === 0 && (
          <Card className="border-0 shadow-md">
            <CardContent className="text-center py-12">
              <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma configuração Z-API encontrada</p>
              <p className="text-sm text-gray-500 mt-1">Adicione vendedores e configure suas credenciais Z-API</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ZAPIConfiguration;
