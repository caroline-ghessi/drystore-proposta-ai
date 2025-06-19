
import { useState, useEffect } from 'react';

interface ProposalExpirationData {
  isExpired: boolean;
  daysRemaining: number;
  canView: boolean;
}

export const useProposalExpiration = (validUntil: string, userRole?: string) => {
  const [expirationData, setExpirationData] = useState<ProposalExpirationData>({
    isExpired: false,
    daysRemaining: 0,
    canView: true
  });

  useEffect(() => {
    const validDate = new Date(validUntil);
    const currentDate = new Date();
    const diffTime = validDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const isExpired = diffDays < 0;
    const isClient = userRole === 'cliente';
    const canView = !isClient || !isExpired;

    setExpirationData({
      isExpired,
      daysRemaining: Math.max(0, diffDays),
      canView
    });
  }, [validUntil, userRole]);

  return expirationData;
};
