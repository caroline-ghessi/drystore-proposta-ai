
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SessionTimeoutConfig {
  timeoutMinutes?: number;
  warningMinutes?: number;
}

export const useSessionTimeout = (config: SessionTimeoutConfig = {}) => {
  const { timeoutMinutes = 30, warningMinutes = 5 } = config;
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const { logout } = useAuth();
  const { toast } = useToast();

  const resetTimer = useCallback(() => {
    setShowWarning(false);
    setTimeLeft(timeoutMinutes * 60);
  }, [timeoutMinutes]);

  const handleLogout = useCallback(() => {
    logout();
    toast({
      title: "Sessão Expirada",
      description: "Sua sessão foi encerrada por segurança.",
      variant: "destructive"
    });
  }, [logout, toast]);

  const extendSession = useCallback(() => {
    resetTimer();
    toast({
      title: "Sessão Estendida",
      description: "Sua sessão foi renovada com sucesso."
    });
  }, [resetTimer, toast]);

  useEffect(() => {
    resetTimer();

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const newTimeLeft = prev - 1;
        
        if (newTimeLeft <= 0) {
          handleLogout();
          return 0;
        }
        
        if (newTimeLeft <= warningMinutes * 60 && !showWarning) {
          setShowWarning(true);
          toast({
            title: "Sessão Expirando",
            description: `Sua sessão expirará em ${Math.ceil(newTimeLeft / 60)} minutos.`,
            variant: "destructive"
          });
        }
        
        return newTimeLeft;
      });
    }, 1000);

    // Reset timer on user activity
    const resetOnActivity = () => resetTimer();
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetOnActivity, true);
    });

    return () => {
      clearInterval(interval);
      events.forEach(event => {
        document.removeEventListener(event, resetOnActivity, true);
      });
    };
  }, [resetTimer, handleLogout, warningMinutes, showWarning, toast]);

  return {
    showWarning,
    timeLeft: Math.ceil(timeLeft / 60),
    extendSession
  };
};
