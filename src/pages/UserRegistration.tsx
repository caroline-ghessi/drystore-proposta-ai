
import Layout from '@/components/Layout';
import { UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useAuthFlow } from '@/hooks/useAuthFlow';
import { UserRegistrationForm } from '@/components/user-registration/UserRegistrationForm';
import { UserTypeInfo } from '@/components/user-registration/UserTypeInfo';
import { AdminConfirmationDialog } from '@/components/user-registration/AdminConfirmationDialog';

interface UserRegistrationFormData {
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
  const [pendingFormData, setPendingFormData] = useState<UserRegistrationFormData | null>(null);
  const { signUp } = useAuthFlow();
  
  const form = useForm<UserRegistrationFormData>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      role: 'vendedor_interno',
      territory: '',
      password: ''
    }
  });

  const onSubmit = async (data: UserRegistrationFormData) => {
    // Se é admin, mostrar confirmação
    if (data.role === 'admin') {
      setPendingFormData(data);
      setShowAdminConfirmation(true);
      return;
    }

    await createUser(data);
  };

  const createUser = async (data: UserRegistrationFormData) => {
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

  const handleAdminCancel = () => {
    setShowAdminConfirmation(false);
    setPendingFormData(null);
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
            <div className="lg:col-span-2">
              <UserRegistrationForm 
                form={form}
                onSubmit={onSubmit}
                isSubmitting={isSubmitting}
                selectedRole={selectedRole}
              />
            </div>

            <UserTypeInfo selectedRole={selectedRole} />
          </div>
        </div>
      </div>

      <AdminConfirmationDialog
        open={showAdminConfirmation}
        onOpenChange={setShowAdminConfirmation}
        onConfirm={handleAdminConfirmation}
        onCancel={handleAdminCancel}
      />
    </Layout>
  );
};

export default UserRegistration;
