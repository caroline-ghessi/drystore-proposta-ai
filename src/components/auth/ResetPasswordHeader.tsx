
interface ResetPasswordHeaderProps {
  title: string;
  subtitle: string;
}

export const ResetPasswordHeader = ({ title, subtitle }: ResetPasswordHeaderProps) => {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center mb-4">
        <img 
          className="h-16 w-auto" 
          src="/lovable-uploads/54b2f5dc-8781-4f2f-9f68-d966142e985d.png" 
          alt="DryStore" 
        />
      </div>
      <p className="text-gray-600">{subtitle}</p>
    </div>
  );
};
