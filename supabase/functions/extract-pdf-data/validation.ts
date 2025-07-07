
export class FileValidator {
  static validateFile(file: File): void {
    if (!file) {
      throw new Error('No file provided');
    }

    console.log('File received:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Validate file type
    if (file.type !== 'application/pdf') {
      throw new Error('Only PDF files are supported');
    }

    // Validate size (maximum 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size must be less than 10MB');
    }
  }

  static validateAdobeCredentials(): { clientId: string; clientSecret: string; orgId: string } {
    // Tentar ambos os nomes para compatibilidade
    const adobeClientId = Deno.env.get('ADOBE_CLIENT_ID') || Deno.env.get('ADOBE_PDF_API_KEY');
    const adobeClientSecret = Deno.env.get('ADOBE_CLIENT_SECRET');
    const adobeOrgId = Deno.env.get('ADOBE_ORG_ID');

    console.log('🔑 Verificando disponibilidade das credenciais Adobe...');
    console.log('✅ Variáveis de ambiente disponíveis:');
    console.log('- ADOBE_CLIENT_ID:', !!Deno.env.get('ADOBE_CLIENT_ID'));
    console.log('- ADOBE_PDF_API_KEY:', !!Deno.env.get('ADOBE_PDF_API_KEY'));
    console.log('- ADOBE_CLIENT_SECRET:', !!adobeClientSecret);
    console.log('- ADOBE_ORG_ID:', !!adobeOrgId);
    
    console.log('🔍 Client ID final (usando fallback):', !!adobeClientId);
    
    if (!adobeClientId || !adobeClientSecret || !adobeOrgId) {
      console.error('❌ Credenciais Adobe faltando!');
      console.error('Missing credentials:', {
        clientId: !adobeClientId,
        clientSecret: !adobeClientSecret,
        orgId: !adobeOrgId
      });
      throw new Error('Adobe PDF Services credentials not configured. Please contact administrator.');
    }

    // Validação mínima - apenas verificar se existem
    if (!adobeClientId || adobeClientId.length < 5) {
      throw new Error('Adobe Client ID/API Key missing or too short');
    }

    if (!adobeClientSecret || adobeClientSecret.length < 5) {
      throw new Error('Adobe Client Secret missing or too short');
    }

    if (!adobeOrgId || adobeOrgId.length < 5) {
      throw new Error('Adobe Org ID missing or too short');
    }

    console.log('✅ Credenciais Adobe carregadas com sucesso');
    console.log('🔍 Client ID length:', adobeClientId.length);
    console.log('🔍 Client Secret length:', adobeClientSecret.length);
    console.log('🔍 Org ID length:', adobeOrgId.length);

    return {
      clientId: adobeClientId,
      clientSecret: adobeClientSecret,
      orgId: adobeOrgId
    };
  }
}
