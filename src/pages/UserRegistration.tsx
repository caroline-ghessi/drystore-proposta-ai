
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UserPlus, Users, Shield, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useAuthFlow } from '@/hooks/useAuthFlow';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface UserRegistrationForm {
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'vendedor_interno' | 'representante';
  territory?: string;
  password: string;
}

const UserRegistration = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdminConfirmation, setShowAdminConfirmation] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<UserRegistrationForm | null>(null);
  const { signUp } = useAuthFlow();
  
  const form = useForm<UserRegistrationForm>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      role: 'vendedor_interno',
      territory: '',
      password: ''
    }
  });

  const onSubmit = async (data: UserRegistrationForm) => {
    // Se é admin, mostrar confirmação
    if (data.role === 'admin') {
      setPendingFormData(data);
      setShowAdminConfirmation(true);
      return;
    }

    await createUser(data);
  };

  const createUser = async (data: UserRegistrationForm) => {
    setIsSubmitting(true);
    
    try {
      // Gerar senha temporária se não fornecida
      const tempPassword = data.password || `temp${Math.random().toString(36).slice(-8)}`;
      
      const result = await signUp(data.email, tempPassword, data.name, data.role);
      
      if (result.success) {
        const roleDisplay = {
          admin: 'Administrador',
          vendedor_interno: 'Vendedor Interno',
          representante: 'Representante'
        };

        toast({
          title: "Usuário cadastrado com sucesso!",
          description: `${data.name} foi adicionado como ${roleDisplay[data.role]}. ${!data.password ? 'Uma senha temporária foi gerada.' : ''}`,
        });
        
        form.reset();
        setShowAdminConfirmation(false);
        setPendingFormData(null);
      }
    } catch (error) {
      toast({
        title: "Erro ao cadastrar usuário",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminConfirmation = () => {
    if (pendingFormData) {
      createUser(pendingFormData);
    }
  };

  const selectedRole = form.watch('role');

  return (
    <Layout>
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
              <UserPlus className="w-10 h-10 mr-3 text-blue-600" />
              Cadastro de Usuários
            </h1>
            <p className="text-lg text-gray-600">Adicionar novos usuários ao sistema</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulário de Cadastro */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserPlus className="w-5 h-5 mr-2 text-blue-600" />
                    Novo Usuário
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome Completo</FormLabel>
                              <FormControl>
                                <Input placeholder="Digite o nome completo" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>E-mail</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="email@exemplo.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefone</FormLabel>
                              <FormControl>
                                <Input placeholder="(11) 99999-9999" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Usuário</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="vendedor_interno">Vendedor Interno</SelectItem>
                                  <SelectItem value="representante">Representante</SelectItem>
                                  <SelectItem value="admin">
                                    <div className="flex items-center">
                                      <Shield className="w-4 h-4 mr-2 text-red-500" />
                                      Administrador
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {selectedRole === 'admin' && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start">
                            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                            <div>
                              <h4 className="font-medium text-red-900">Atenção: Privilégios de Administrador</h4>
                              <p className="text-sm text-red-700 mt-1">
                                Administradores têm acesso total ao sistema, incluindo criação/exclusão de usuários,
                                configurações do sistema e todos os dados. Use com extrema cautela.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Senha (Opcional)</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Deixe em branco para gerar automaticamente" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {selectedRole === 'representante' && (
                        <FormField
                          control={form.control}
                          name="territory"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Território</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: São Paulo - Capital, Rio de Janeiro..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Cadastrando..." : "Cadastrar Usuário"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* Informações Laterais */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Users className="w-5 h-5 mr-2 text-green-600" />
                    Tipos de Usuário
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900">Vendedor Interno</h4>
                    <p className="text-sm text-blue-700">Funcionário da empresa com acesso completo ao sistema de vendas.</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-900">Representante</h4>
                    <p className="text-sm text-purple-700">Vendedor externo com acesso específico ao seu território.</p>
                  </div>
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-900 flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      Administrador
                    </h4>
                    <p className="text-sm text-red-700">Acesso total ao sistema, incluindo gestão de usuários e configurações.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Permissões</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Acesso ao sistema de propostas</li>
                    <li>• Gerenciamento de clientes</li>
                    <li>• Relatórios de vendas</li>
                    <li>• CRM e follow-ups</li>
                    <li>• Agenda inteligente</li>
                    {selectedRole === 'admin' && (
                      <>
                        <li className="text-red-600 font-medium">• Gestão de usuários</li>
                        <li className="text-red-600 font-medium">• Configurações do sistema</li>
                        <li className="text-red-600 font-medium">• Acesso a todos os dados</li>
                      </>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de Confirmação para Admin */}
      <AlertDialog open={showAdminConfirmation} onOpenChange={setShowAdminConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-red-500" />
              Confirmar Criação de Administrador
            </AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a criar um usuário com privilégios de <strong>Administrador</strong>.
              Este usuário terá acesso total ao sistema, incluindo:
              <br /><br />
              • Criar e gerenciar outros usuários<br />
              • Acessar todas as configurações do sistema<br />
              • Visualizar todos os dados e relatórios<br />
              • Modificar permissões e configurações críticas<br />
              <br />
              <strong>Tem certeza que deseja continuar?</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowAdminConfirmation(false);
              setPendingFormData(null);
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAdminConfirmation}
              className="bg-red-600 hover:bg-red-700"
            >
              Sim, Criar Administrador
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default UserRegistration;
