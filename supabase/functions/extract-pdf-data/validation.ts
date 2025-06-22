
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

    if (!adobeClientId || !adobeClientSecret || !adobeOrgId) {
      throw new Error('Adobe API credentials not configured');
    }

    console.log('Adobe credentials loaded - Client ID:', adobeClientId.substring(0, 8) + '...');
    console.log('Adobe Org ID:', adobeOrgId);

    return {
      clientId: adobeClientId,
      clientSecret: adobeClientSecret,
      orgId: adobeOrgId
    };
  }
}
