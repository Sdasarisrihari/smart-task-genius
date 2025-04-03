
/**
 * Utility functions for handling two-factor authentication
 */

/**
 * Generate a random verification code
 * @returns {string} 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send verification code via SMS
 * This would typically call an SMS API service
 */
export async function sendVerificationSMS(phoneNumber: string, code: string): Promise<boolean> {
  try {
    console.log(`[SMS DEMO] Sending verification code ${code} to ${phoneNumber}`);
    // In a real implementation, this would call an SMS API
    // await smsService.send(phoneNumber, `Your verification code is: ${code}`);
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
}

/**
 * Send verification code via Email
 */
export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  try {
    console.log(`[EMAIL DEMO] Sending verification code ${code} to ${email}`);
    // In a real implementation, this would call an email API
    // await emailService.send(email, 'Your verification code', `Your verification code is: ${code}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Verify a user-provided code against the expected code
 */
export function verifyCode(userCode: string, expectedCode: string): boolean {
  return userCode === expectedCode;
}

/**
 * Store verification data in session storage
 */
export function storeVerificationData(userId: string, code: string, expiresAt: number): void {
  sessionStorage.setItem(`2fa_${userId}`, JSON.stringify({
    code,
    expiresAt
  }));
}

/**
 * Get verification data from session storage
 */
export function getVerificationData(userId: string): { code: string; expiresAt: number } | null {
  const data = sessionStorage.getItem(`2fa_${userId}`);
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Error parsing verification data:', error);
    return null;
  }
}

/**
 * Clear verification data from session storage
 */
export function clearVerificationData(userId: string): void {
  sessionStorage.removeItem(`2fa_${userId}`);
}
