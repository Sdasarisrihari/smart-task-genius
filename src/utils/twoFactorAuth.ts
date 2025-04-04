/**
 * Security utility functions
 * Note: 2FA functionality has been removed
 */

/**
 * Generate a random verification code
 * @returns {string} 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
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
 * Store session data in local storage
 */
export function storeSessionData(userId: string, expiresAt: number): void {
  localStorage.setItem(`session_${userId}`, JSON.stringify({
    expiresAt
  }));
}

/**
 * Get session data from local storage
 */
export function getSessionData(userId: string): { expiresAt: number } | null {
  const data = localStorage.getItem(`session_${userId}`);
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Error parsing session data:', error);
    return null;
  }
}

/**
 * Clear session data from local storage
 */
export function clearSessionData(userId: string): void {
  localStorage.removeItem(`session_${userId}`);
}

/**
 * Check for suspicious login activity
 */
export function checkSuspiciousActivity(userId: string, ipAddress: string): boolean {
  // In a real app, you would check against known IPs, locations, etc.
  // For demo purposes, just returning false
  return false;
}

/**
 * Log login attempt
 */
export function logLoginAttempt(userId: string, success: boolean): void {
  const attempts = JSON.parse(localStorage.getItem(`login_attempts_${userId}`) || '[]');
  attempts.push({
    timestamp: new Date().toISOString(),
    success
  });
  
  // Keep only last 10 attempts
  if (attempts.length > 10) {
    attempts.shift();
  }
  
  localStorage.setItem(`login_attempts_${userId}`, JSON.stringify(attempts));
}
