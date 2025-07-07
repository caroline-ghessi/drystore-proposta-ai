
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
    const adobeClientId = Deno.env.get('ADOBE_CLIENT_ID');
    const adobeClientSecret = Deno.env.get('ADOBE_CLIENT_SECRET');
    const adobeOrgId = Deno.env.get('ADOBE_ORG_ID');

    console.log('🔑 Checking Adobe credentials availability...');
    console.log('Client ID exists:', !!adobeClientId);
    console.log('Client Secret exists:', !!adobeClientSecret); 
    console.log('Org ID exists:', !!adobeOrgId);

    if (!adobeClientId || !adobeClientSecret || !adobeOrgId) {
      console.error('❌ Adobe credentials missing!');
      throw new Error('Adobe PDF Services credentials not configured. Please contact administrator.');
    }

    // Validate credential format
    if (!adobeClientId.includes('-') || adobeClientId.length < 20) {
      throw new Error('Invalid Adobe Client ID format');
    }

    if (!adobeOrgId.includes('@') || !adobeOrgId.includes('AdobeOrg')) {
      throw new Error('Invalid Adobe Org ID format'); 
    }

    console.log('✅ Adobe credentials validated - Client ID:', adobeClientId.substring(0, 8) + '...');
    console.log('✅ Adobe Org ID validated:', adobeOrgId.substring(0, 15) + '...');

    return {
      clientId: adobeClientId,
      clientSecret: adobeClientSecret,
      orgId: adobeOrgId
    };
  }
}
