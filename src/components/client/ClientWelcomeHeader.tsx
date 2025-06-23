
interface ClientWelcomeHeaderProps {
  clientName: string;
}

const ClientWelcomeHeader = ({ clientName }: ClientWelcomeHeaderProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Bem-vindo, {clientName}!
      </h1>
      <p className="text-gray-600">
        Aqui você pode visualizar todas as suas propostas
      </p>
    </div>
  );
};

export default ClientWelcomeHeader;
