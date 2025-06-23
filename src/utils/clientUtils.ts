
// Função utilitária para verificar se é um UUID válido
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const getClientNameFromSlug = (slug: string): string => {
  if (!slug) return 'Cliente';
  
  // Se for um UUID, retornar uma string genérica
  if (isValidUUID(slug)) {
    return 'Cliente';
  }
  
  // Converter slug em nome legível
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const generateClientSlug = (clientName: string): string => {
  return clientName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
    .trim()
    .replace(/\s+/g, '-'); // Substitui espaços por hífens
};

// Função para validar se um email tem formato válido
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Função para formatar nome do cliente
export const formatClientName = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Função para obter a cor do status da proposta
export const getProposalStatusColor = (status: string): string => {
  switch (status) {
    case 'aceita':
    case 'accepted':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'pendente':
    case 'sent':
    case 'viewed':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'expirada':
    case 'expired':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'rejeitada':
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'draft':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Função para obter o label do status da proposta
export const getProposalStatusLabel = (status: string): string => {
  switch (status) {
    case 'aceita':
    case 'accepted':
      return 'Aceita';
    case 'pendente':
    case 'sent':
    case 'viewed':
      return 'Pendente';
    case 'expirada':
    case 'expired':
      return 'Expirada';
    case 'rejeitada':
    case 'rejected':
      return 'Rejeitada';
    case 'draft':
      return 'Rascunho';
    default:
      return 'Desconhecido';
  }
};

// Função para formatar número da proposta
export const formatProposalNumber = (id: string, createdAt?: string): string => {
  return `PROP-${id.substring(0, 8)}`;
};

// Função para verificar se uma proposta está expirada
export const isProposalExpired = (validUntil: string): boolean => {
  return new Date(validUntil) < new Date();
};
