
interface TotalsSectionProps {
  subtotal: number;
  total: number;
}

const TotalsSection = ({ subtotal, total }: TotalsSectionProps) => {
  return (
    <div className="flex justify-end">
      <div className="w-64 space-y-2">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span className="font-medium">
            R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t pt-2">
          <span>Total:</span>
          <span>
            R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TotalsSection;
