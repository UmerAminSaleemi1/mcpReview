export type TurnstileVerificationResult = {
  success: boolean;
  message: string;
};

export async function verifyTurnstileToken(token: string): Promise<TurnstileVerificationResult> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY?.trim();

  if (!secretKey) {
    return {
      success: false,
      message: 'Turnstile is not configured for this environment. Submission was blocked until the app has a valid secret.',
    };
  }

  if (!token || token.trim().length < 10) {
    return {
      success: false,
      message: 'Captcha verification is missing or invalid.',
    };
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ response: token, secret: secretKey }).toString(),
    });

    const payload = (await response.json()) as { success?: boolean; 'error-codes'?: string[] };

    if (!payload.success) {
      return {
        success: false,
        message: 'Captcha verification failed. Please retry.',
      };
    }

    return { success: true, message: 'Captcha verified.' };
  } catch {
    return {
      success: false,
      message: 'Captcha verification could not be completed right now. Please retry later.',
    };
  }
}
