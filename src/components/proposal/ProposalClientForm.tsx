
import ClientQuestionForm from '@/components/proposal/ClientQuestionForm';

interface ProposalClientFormProps {
  onQuestionSubmit: (question: string) => void;
}

export const ProposalClientForm = ({ onQuestionSubmit }: ProposalClientFormProps) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <ClientQuestionForm onQuestionSubmit={onQuestionSubmit} />
    </div>
  );
};
