
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
import { Shield } from 'lucide-react';

interface AdminConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const AdminConfirmationDialog = ({ 
  open, 
  onOpenChange, 
  onConfirm, 
  onCancel 
}: AdminConfirmationDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
          <AlertDialogCancel onClick={onCancel}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Sim, Criar Administrador
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
