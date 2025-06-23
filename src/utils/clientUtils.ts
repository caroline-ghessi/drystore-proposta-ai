
export const generateClientSlug = (nome: string): string => {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .trim()
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-'); // Remove hífens duplicados
};

export const getClientNameFromSlug = (slug: string): string => {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const formatProposalNumber = (id: string, created_at: string): string => {
  const date = new Date(created_at);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const shortId = id.substring(0, 8).toUpperCase();
  return `PROP-${year}${month}-${shortId}`;
};

export const getProposalStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    'draft': 'Rascunho',
    'sent': 'Enviada',
    'viewed': 'Visualizada',
    'accepted': 'Aceita',
    'rejected': 'Rejeitada',
    'expired': 'Expirada'
  };
  return statusMap[status] || status;
};

export const getProposalStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'draft': 'bg-gray-100 text-gray-800',
    'sent': 'bg-blue-100 text-blue-800',
    'viewed': 'bg-yellow-100 text-yellow-800',
    'accepted': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'expired': 'bg-red-100 text-red-800'
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

export const isProposalExpired = (validade: string): boolean => {
  return new Date(validade) < new Date();
};
