
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAdvancedValidation } from '@/hooks/useAdvancedValidation';

interface AdvancedPasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

const AdvancedPasswordField = ({
  id,
  label,
  value,
  onChange,
  placeholder = "Digite uma senha segura",
  required = false,
  disabled = false
}: AdvancedPasswordFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const { checkPasswordStrength } = useAdvancedValidation();
  
  const strength = checkPasswordStrength(value);
  
  const getStrengthColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStrengthText = (score: number) => {
    if (score >= 80) return 'Muito Forte';
    if (score >= 60) return 'Forte';
    if (score >= 40) return 'Média';
    if (score >= 20) return 'Fraca';
    return 'Muito Fraca';
  };

  const getStrengthIcon = (score: number) => {
    if (score >= 60) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (score >= 40) return <Shield className="w-4 h-4 text-yellow-500" />;
    return <AlertTriangle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="pr-10"
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          disabled={disabled}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {value && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {getStrengthIcon(strength.score)}
              <span>Força da senha: {getStrengthText(strength.score)}</span>
            </div>
            <span className="text-gray-500">{strength.score}/100</span>
          </div>
          
          <Progress value={strength.score} className="h-2">
            <div 
              className={`h-full transition-all ${getStrengthColor(strength.score)}`} 
              style={{ width: `${strength.score}%` }} 
            />
          </Progress>

          {strength.feedback.length > 0 && strength.score < 80 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium text-yellow-800">Sugestões para melhorar:</p>
                  <ul className="list-disc list-inside text-sm text-yellow-700">
                    {strength.feedback.map((feedback, index) => (
                      <li key={index}>{feedback}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {strength.score >= 80 && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Excelente! Sua senha é muito segura.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedPasswordField;
