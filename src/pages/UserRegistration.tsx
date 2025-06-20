
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UserPlus, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useAuthFlow } from '@/hooks/useAuthFlow';

interface UserRegistrationForm {
  name: string;
  email: string;
  phone: string;
  role: 'vendedor_interno' | 'representante';
  territory?: string;
  password: string;
}

const UserRegistration = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setIsSubmitting(true);
    
    try {
      // Gerar senha temporária se não fornecida
      const tempPassword = data.password || `temp${Math.random().toString(36).slice(-8)}`;
      
      const result = await signUp(data.email, tempPassword, data.name, data.role);
      
      if (result.success) {
        toast({
          title: "Usuário cadastrado com sucesso!",
          description: `${data.name} foi adicionado como ${data.role}. ${!data.password ? 'Uma senha temporária foi gerada.' : ''}`,
        });
        
        form.reset();
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

  return (
    <Layout>
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
              <UserPlus className="w-10 h-10 mr-3 text-blue-600" />
              Cadastro de Usuários
            </h1>
            <p className="text-lg text-gray-600">Adicionar novos vendedores e representantes ao sistema</p>
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
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

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

                      <FormField
                        control={form.control}
                        name="territory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Território (Opcional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: São Paulo - Capital, Rio de Janeiro..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserRegistration;
