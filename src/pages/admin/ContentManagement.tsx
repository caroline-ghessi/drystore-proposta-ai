
import Layout from '@/components/Layout';
import PermissionGuard from '@/components/PermissionGuard';
import { ContentManagementTabs } from '@/components/admin/content-management/ContentManagementTabs';

const ContentManagement = () => {
  return (
    <PermissionGuard requiredRole={['admin']}>
      <Layout>
        <div className="animate-fade-in">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Gestão de Conteúdo
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gerencie galeria de projetos, depoimentos, imagens técnicas e arquivos para download
            </p>
          </div>

          <ContentManagementTabs />
        </div>
      </Layout>
    </PermissionGuard>
  );
};

export default ContentManagement;
