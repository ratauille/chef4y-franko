import { GoogleAuth } from 'google-auth-library';

const DEFAULT_PROJECT_ID = 'chef-privado';
const DEFAULT_SITE_KEY = '6LcRcbUtAAAAALu9BaCB9Dagi6ejHwQm0IqEOu1n';
const configuredScore = Number(process.env.RECAPTCHA_MIN_SCORE || '0.4');
const MIN_SCORE = Number.isFinite(configuredScore) ? configuredScore : 0.4;
const ALLOWED_HOSTNAMES = new Set([
  'chef4youbyfranko.com',
  'www.chef4youbyfranko.com',
  'ratauille.github.io',
]);

const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

interface AssessmentResponse {
  tokenProperties?: {
    valid?: boolean;
    hostname?: string;
    action?: string;
    invalidReason?: string;
  };
  riskAnalysis?: {
    score?: number;
    reasons?: string[];
  };
}

export interface RecaptchaVerification {
  valid: boolean;
  status: number;
  reason: string;
  score?: number;
}

export async function verifyRecaptchaToken(
  token: string,
  expectedAction: string,
): Promise<RecaptchaVerification> {
  if (process.env.NODE_ENV === 'test') {
    return { valid: true, status: 200, reason: 'test_environment' };
  }

  if (!token) {
    return { valid: false, status: 403, reason: 'missing_token' };
  }

  const projectId = process.env.RECAPTCHA_PROJECT_ID || DEFAULT_PROJECT_ID;
  const siteKey = process.env.RECAPTCHA_SITE_KEY || DEFAULT_SITE_KEY;
  const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/assessments`;

  try {
    const client = await auth.getClient();
    const response = await client.request<AssessmentResponse>({
      url,
      method: 'POST',
      data: {
        event: {
          token,
          siteKey,
          expectedAction,
        },
      },
    });

    const tokenProperties = response.data.tokenProperties;
    const score = response.data.riskAnalysis?.score ?? 0;
    const hostname = tokenProperties?.hostname || '';

    if (!tokenProperties?.valid) {
      return {
        valid: false,
        status: 403,
        reason: `invalid_token:${tokenProperties?.invalidReason || 'unknown'}`,
        score,
      };
    }

    if (tokenProperties.action !== expectedAction) {
      return { valid: false, status: 403, reason: 'action_mismatch', score };
    }

    if (!ALLOWED_HOSTNAMES.has(hostname)) {
      return { valid: false, status: 403, reason: 'hostname_mismatch', score };
    }

    if (score < MIN_SCORE) {
      return { valid: false, status: 403, reason: 'score_too_low', score };
    }

    return { valid: true, status: 200, reason: 'verified', score };
  } catch (error: any) {
    console.error('[reCAPTCHA] Assessment request failed', {
      status: error?.response?.status,
      message: error?.message,
    });
    return { valid: false, status: 503, reason: 'assessment_unavailable' };
  }
}
