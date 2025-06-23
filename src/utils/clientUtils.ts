
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
