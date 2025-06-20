
import { Progress } from '@/components/ui/progress';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;
    return strength;
  };

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength < 50) return 'bg-red-500';
    if (strength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordCriteria = (password: string) => {
    return [
      { text: 'Pelo menos 8 caracteres', met: password.length >= 8 },
      { text: 'Uma letra minúscula', met: /[a-z]/.test(password) },
      { text: 'Uma letra maiúscula', met: /[A-Z]/.test(password) },
      { text: 'Um número', met: /\d/.test(password) }
    ];
  };

  const passwordStrength = calculatePasswordStrength(password);
  const passwordCriteria = getPasswordCriteria(password);

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span>Força da senha:</span>
        <span className={passwordStrength >= 75 ? 'text-green-600' : passwordStrength >= 50 ? 'text-yellow-600' : 'text-red-600'}>
          {passwordStrength >= 75 ? 'Forte' : passwordStrength >= 50 ? 'Média' : 'Fraca'}
        </span>
      </div>
      <Progress value={passwordStrength} className="h-2">
        <div className={`h-full transition-all ${getPasswordStrengthColor(passwordStrength)}`} style={{ width: `${passwordStrength}%` }} />
      </Progress>
      <div className="space-y-1">
        {passwordCriteria.map((criterion, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            {criterion.met ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <X className="w-3 h-3 text-gray-400" />
            )}
            <span className={criterion.met ? 'text-green-600' : 'text-gray-500'}>
              {criterion.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
