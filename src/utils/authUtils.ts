
export const getRedirectRoute = (userRole: string) => {
  switch (userRole) {
    case 'admin':
      return '/dashboard';
    case 'vendedor_interno':
      return '/dashboard';
    case 'representante':
      return '/dashboard';
    case 'cliente':
      return '/client-portal';
    default:
      return '/dashboard';
  }
};
