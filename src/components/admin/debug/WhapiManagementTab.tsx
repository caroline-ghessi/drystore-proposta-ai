import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Copy, 
  Phone,
  Webhook,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWhapiAPI, type WhapiInstance } from '@/hooks/useWhapiAPI';
import { useAuth } from '@/contexts/AuthContext';

const WhapiManagementTab = () => {
  const [instances, setInstances] = useState<WhapiInstance[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInstance, setEditingInstance] = useState<WhapiInstance | null>(null);
  const [formData, setFormData] = useState({
    vendorName: '',
    instanceId: '',
    token: '',
    phoneNumber: ''
  });

  const { 
    getWhapiInstances, 
    createWhapiInstance, 
    updateWhapiInstance, 
    deleteWhapiInstance,
    testWhapiInstance,
    isLoading 
  } = useWhapiAPI();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadInstances();
  }, []);

  const loadInstances = async () => {
    const data = await getWhapiInstances();
    setInstances(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vendorName || !formData.instanceId || !formData.token) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingInstance) {
        // Atualizar instância existente
        const success = await updateWhapiInstance(editingInstance.id, {
          vendor_name: formData.vendorName,
          token: formData.token,
          phone_number: formData.phoneNumber || undefined
        });
        
        if (success) {
          await loadInstances();
          setIsDialogOpen(false);
          resetForm();
        }
      } else {
        // Criar nova instância
        const newInstance = await createWhapiInstance(
          user?.id || '',
          formData.vendorName,
          formData.instanceId,
          formData.token,
          formData.phoneNumber || undefined
        );
        
        if (newInstance) {
          await loadInstances();
          setIsDialogOpen(false);
          resetForm();
        }
      }
    } catch (error) {
      console.error('Erro ao salvar instância:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      vendorName: '',
      instanceId: '',
      token: '',
      phoneNumber: ''
    });
    setEditingInstance(null);
  };

  const handleEdit = (instance: WhapiInstance) => {
    setEditingInstance(instance);
    setFormData({
      vendorName: instance.vendor_name,
      instanceId: instance.instance_id,
      token: instance.token,
      phoneNumber: instance.phone_number || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (instance: WhapiInstance) => {
    if (window.confirm(`Tem certeza que deseja remover a instância ${instance.instance_id}?`)) {
      const success = await deleteWhapiInstance(instance.id);
      if (success) {
        await loadInstances();
      }
    }
  };

  const copyWebhookUrl = (webhookUrl: string) => {
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: "Copiado!",
      description: "URL do webhook copiada para a área de transferência",
    });
  };

  const getStatusIcon = (instance: WhapiInstance) => {
    if (!instance.last_heartbeat) {
      return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
    
    const lastHeartbeat = new Date(instance.last_heartbeat);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastHeartbeat.getTime()) / (1000 * 60);
    
    if (diffMinutes < 5) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    } else if (diffMinutes < 30) {
      return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    } else {
      return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusText = (instance: WhapiInstance) => {
    if (!instance.last_heartbeat) {
      return 'Nunca conectou';
    }
    
    const lastHeartbeat = new Date(instance.last_heartbeat);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastHeartbeat.getTime()) / (1000 * 60);
    
    if (diffMinutes < 5) {
      return 'Online';
    } else if (diffMinutes < 30) {
      return `Última atividade: ${Math.round(diffMinutes)}min atrás`;
    } else {
      return 'Offline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Instâncias Whapi</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie as instâncias WhatsApp dos vendedores
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Instância
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingInstance ? 'Editar Instância' : 'Nova Instância Whapi'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vendorName">Nome do Vendedor *</Label>
                <Input
                  id="vendorName"
                  value={formData.vendorName}
                  onChange={(e) => setFormData(prev => ({ ...prev, vendorName: e.target.value }))}
                  placeholder="Ex: João Silva"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instanceId">ID da Instância *</Label>
                <Input
                  id="instanceId"
                  value={formData.instanceId}
                  onChange={(e) => setFormData(prev => ({ ...prev, instanceId: e.target.value }))}
                  placeholder="Ex: whapi-joao-silva"
                  disabled={!!editingInstance}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="token">Token Whapi *</Label>
                <Input
                  id="token"
                  type="password"
                  value={formData.token}
                  onChange={(e) => setFormData(prev => ({ ...prev, token: e.target.value }))}
                  placeholder="Token da API Whapi"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Número do WhatsApp</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="Ex: +5511999999999"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {editingInstance ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Instâncias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Instâncias Configuradas ({instances.length})
          </CardTitle>
          <CardDescription>
            Cada vendedor deve ter sua própria instância com webhook único
          </CardDescription>
        </CardHeader>
        <CardContent>
          {instances.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Nenhuma instância Whapi configurada ainda. Clique em "Nova Instância" para começar.
              </AlertDescription>
            </Alert>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {instances.map((instance) => (
                  <div
                    key={instance.id}
                    className={`p-4 rounded-lg border ${instance.is_active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(instance)}
                          <h4 className="font-medium">{instance.vendor_name}</h4>
                          <Badge variant={instance.is_active ? 'default' : 'secondary'}>
                            {instance.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <p><strong>Instância:</strong> {instance.instance_id}</p>
                          <p><strong>Status:</strong> {getStatusText(instance)}</p>
                          {instance.phone_number && (
                            <p><strong>Telefone:</strong> {instance.phone_number}</p>
                          )}
                          <p><strong>Criado em:</strong> {new Date(instance.created_at).toLocaleDateString('pt-BR')}</p>
                        </div>
                        
                        <Separator className="my-3" />
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Webhook className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium">URL do Webhook:</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <code className="flex-1 p-2 bg-gray-100 rounded text-xs break-all">
                              {instance.webhook_url}
                            </code>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyWebhookUrl(instance.webhook_url)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testWhapiInstance(instance.instance_id)}
                          disabled={isLoading}
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          Testar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(instance)}
                        >
                          <Edit2 className="w-3 h-3 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(instance)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>Como Configurar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium">1. Obter Token Whapi</h4>
            <p className="text-muted-foreground">
              Acesse o painel da Whapi, conecte uma instância do WhatsApp e copie o token de acesso.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">2. Configurar Webhook</h4>
            <p className="text-muted-foreground">
              Use a URL de webhook gerada automaticamente aqui no painel da Whapi para receber atualizações de status.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">3. Testar Conectividade</h4>
            <p className="text-muted-foreground">
              Clique em "Testar" para verificar se a instância está funcionando corretamente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhapiManagementTab;