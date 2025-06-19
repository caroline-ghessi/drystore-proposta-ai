
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface ProposalBenefitsProps {
  benefits: string[];
}

export const ProposalBenefits = ({ benefits }: ProposalBenefitsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Check className="w-5 h-5 mr-2 text-green-600" />
          Por que escolher nossa solução?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-sm text-gray-700">{benefit}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
