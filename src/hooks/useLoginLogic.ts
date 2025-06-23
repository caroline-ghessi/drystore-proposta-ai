
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { sanitizeInput } from '@/utils/authValidation';

export const useLoginLogic = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginStep, setLoginStep] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (email: string, password: string) => {
    setError('');
    setLoading(true);
    setLoginStep('Validando dados...');

    try {
      const sanitizedEmail = sanitizeInput(email);
      const sanitizedPassword = password;

      if (!sanitizedEmail || !sanitizedPassword) {
        setError('Por favor, preencha todos os campos');
        setLoading(false);
        setLoginStep('');
        return;
      }

      if (sanitizedPassword.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres');
        setLoading(false);
        setLoginStep('');
        return;
      }

      setLoginStep('Conectando...');

      const loginTimeout = setTimeout(() => {
        setError('Login está demorando mais que o esperado. Tente novamente.');
        setLoading(false);
        setLoginStep('');
      }, 15000);

      const result = await login(sanitizedEmail, sanitizedPassword);
      
      clearTimeout(loginTimeout);
      
      if (result.success) {
        setLoginStep('Carregando perfil...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        setError(result.error || 'Erro desconhecido durante o login');
        setLoading(false);
        setLoginStep('');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Erro inesperado. Tente novamente.');
      setLoading(false);
      setLoginStep('');
    }
  };

  return {
    error,
    loading,
    loginStep,
    handleSubmit
  };
};
