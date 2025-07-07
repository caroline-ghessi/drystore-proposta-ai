
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

    // Basic validation - only check if they exist and have reasonable length
    if (adobeClientId.length < 10) {
      throw new Error('Adobe Client ID appears to be too short');
    }

    if (adobeClientSecret.length < 10) {
      throw new Error('Adobe Client Secret appears to be too short');
    }

    if (!adobeOrgId.includes('@') || !adobeOrgId.includes('AdobeOrg')) {
      throw new Error('Adobe Org ID format invalid - should contain @ and AdobeOrg'); 
    }

    console.log('✅ Adobe credentials basic validation passed');
    console.log('🔍 Client ID length:', adobeClientId.length);
    console.log('🔍 Client Secret length:', adobeClientSecret.length);
    console.log('🔍 Org ID format:', adobeOrgId.includes('@') && adobeOrgId.includes('AdobeOrg'));

    return {
      clientId: adobeClientId,
      clientSecret: adobeClientSecret,
      orgId: adobeOrgId
    };
  }
}
