
import Layout from '@/components/Layout';
import PermissionGuard from '@/components/PermissionGuard';
import ApprovalWorkflow from '@/components/approval/ApprovalWorkflow';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const ApprovalManagement = () => {
  const { toast } = useToast();
  
  const [pendingApprovals, setPendingApprovals] = useState([
    {
      id: '1',
      proposalId: 'prop-1',
      proposalNumber: 'PROP-2024-007',
      clientName: 'Construtora ABC',
      projectName: 'Galpão Industrial 2000m²',
      value: 350000.00,
      requestedBy: 'Carlos Vendedor',
      requestedAt: '2024-06-19T09:00:00',
      reason: 'Valor acima do limite de R$ 300.000',
      status: 'pending' as const
    },
    {
      id: '2',
      proposalId: 'prop-2',
      proposalNumber: 'PROP-2024-008',
      clientName: 'Shopping Center XYZ',
      projectName: 'Reforma Completa',
      value: 890000.00,
      requestedBy: 'Ana Vendedora',
      requestedAt: '2024-06-19T10:30:00',
      reason: 'Valor acima do limite de R$ 300.000 + desconto especial de 15%',
      status: 'pending' as const
    }
  ]);

  const handleApprove = (approvalId: string, comments: string) => {
    setPendingApprovals(prev => prev.map(approval => 
      approval.id === approvalId 
        ? { ...approval, status: 'approved' as const, approverComments: comments }
        : approval
    ));
  };

  const handleReject = (approvalId: string, comments: string) => {
    setPendingApprovals(prev => prev.map(approval => 
      approval.id === approvalId 
        ? { ...approval, status: 'rejected' as const, approverComments: comments }
        : approval
    ));
  };

  return (
    <Layout>
      <PermissionGuard 
        requiredRole={['admin', 'manager']}
        fallback={
          <div className="text-center py-12">
            <p className="text-gray-500">Acesso negado. Apenas gestores e administradores podem acessar esta área.</p>
          </div>
        }
      >
        <div className="animate-fade-in">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Aprovação de Propostas</h1>
            <p className="text-gray-600">Gerencie propostas que precisam de aprovação interna</p>
          </div>

          <ApprovalWorkflow
            pendingApprovals={pendingApprovals}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>
      </PermissionGuard>
    </Layout>
  );
};

export default ApprovalManagement;
