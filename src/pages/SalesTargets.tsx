
import Layout from '@/components/Layout';
import { SalesTargetManager } from '@/components/admin/SalesTargetManager';
import PermissionGuard from '@/components/PermissionGuard';

const SalesTargets = () => {
  return (
    <PermissionGuard requiredRole={['admin']}>
      <Layout>
        <div className="animate-fade-in">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Gerenciamento de Metas
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Defina e gerencie as metas mensais dos vendedores
            </p>
          </div>

          <SalesTargetManager />
        </div>
      </Layout>
    </PermissionGuard>
  );
};

export default SalesTargets;
