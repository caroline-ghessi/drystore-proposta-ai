
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Phone, Calendar, Shield } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: 'Administrador', variant: 'destructive' as const },
      vendedor_interno: { label: 'Vendedor Interno', variant: 'default' as const },
      vendedor_externo: { label: 'Vendedor Externo', variant: 'secondary' as const },
      cliente: { label: 'Cliente', variant: 'outline' as const }
    };

    const config = roleConfig[role as keyof typeof roleConfig] || { label: role, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
          <p className="text-gray-600">Gerencie suas informações pessoais</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Summary Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="https://github.com/shadcn.png" alt={user?.name} />
                  <AvatarFallback className="text-2xl">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">{user?.name}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
              <div className="flex justify-center mt-3">
                {user?.role && getRoleBadge(user.role)}
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Alterar Foto
              </Button>
            </CardContent>
          </Card>

          {/* Profile Details Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>
                Atualize suas informações de contato e dados pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={user?.name || ''}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value=""
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Função</Label>
                  <Input
                    id="role"
                    value={user?.role || ''}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button className="w-full md:w-auto">
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Resumo de Atividades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h3 className="text-2xl font-bold text-blue-600">12</h3>
                <p className="text-sm text-gray-600">Propostas Criadas</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h3 className="text-2xl font-bold text-green-600">8</h3>
                <p className="text-sm text-gray-600">Propostas Aceitas</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h3 className="text-2xl font-bold text-purple-600">67%</h3>
                <p className="text-sm text-gray-600">Taxa de Conversão</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;
