
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UserPlus, Shield, AlertTriangle } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

interface UserRegistrationForm {
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'vendedor_interno' | 'representante';
  territory?: string;
  password: string;
}

interface UserRegistrationFormProps {
  form: UseFormReturn<UserRegistrationForm>;
  onSubmit: (data: UserRegistrationForm) => Promise<void>;
  isSubmitting: boolean;
  selectedRole: string;
}

export const UserRegistrationForm = ({ form, onSubmit, isSubmitting, selectedRole }: UserRegistrationFormProps) => {
  return (
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
  );
};
