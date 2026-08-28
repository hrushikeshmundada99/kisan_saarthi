// SMS Delivery Service for Indian Mobile Numbers.
//
// The Fast2SMS gateway key is held server-side only (FAST2SMS_API_KEY) and is
// used by the /api/fast2sms serverless proxy. The browser never receives, stores
// or transmits a gateway key - anything shipped to the client can be read out of
// the bundle by any visitor and used to spend the account's SMS credits.

export interface SmsSendResponse {
  success: boolean;
  message: string;
  requestId?: string;
  gateway: 'Fast2SMS' | 'Native';
  /** False when the server has no FAST2SMS_API_KEY configured. */
  configured?: boolean;
  errorDetails?: string;
}

/**
 * Asks the server whether the cloud SMS gateway is usable.
 * Returns false when FAST2SMS_API_KEY is unset, so the UI can steer the farmer
 * towards the native SIM option instead of showing a confusing send failure.
 */
export const isSmsGatewayConfigured = async (): Promise<boolean> => {
  try {
    const res = await fetch('/api/fast2sms', { method: 'GET' });
    if (!res.ok) return false;
    const data = await res.json();
    return data?.configured === true;
  } catch {
    return false;
  }
};

/**
 * Sends an SMS through the server-side Fast2SMS proxy.
 * Only the recipient number and the message text leave the browser.
 */
export const sendRealSmsToIndianMobile = async (
  mobileNumber: string,
  messageText: string
): Promise<SmsSendResponse> => {
  const cleanNumber = mobileNumber.replace(/\D/g, '').slice(-10);

  if (!/^[6-9]\d{9}$/.test(cleanNumber)) {
    return {
      success: false,
      message: 'कृपया १०-अंकी वैध मोबाईल नंबर प्रविष्ट करा',
      gateway: 'Fast2SMS'
    };
  }

  try {
    const response = await fetch('/api/fast2sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cache-control': 'no-cache'
      },
      body: JSON.stringify({
        numbers: cleanNumber,
        message: messageText,
        route: 'v3',
        language: 'unicode'
      })
    });

    const result = await response.json().catch(() => null);

    if (response.status === 503) {
      return {
        success: false,
        configured: false,
        message:
          'क्लाउड SMS गेटवे सर्व्हरवर कॉन्फिगर केलेले नाही. कृपया "फोनच्या SIM मधून पाठवा" पर्याय वापरा.',
        gateway: 'Fast2SMS',
        errorDetails: result?.message || 'FAST2SMS_API_KEY is not set on the server'
      };
    }

    if (response.ok && result && result.return === true) {
      return {
        success: true,
        configured: true,
        message: `+91 ${cleanNumber} वर प्रत्यक्ष SMS यशस्वीरीत्या पाठवला! (Delivered via Fast2SMS)`,
        requestId: result.request_id || `req-${Date.now()}`,
        gateway: 'Fast2SMS'
      };
    }

    const errMsg = Array.isArray(result?.message)
      ? result.message.join(', ')
      : result?.message || 'SMS Gateway Error';

    return {
      success: false,
      configured: true,
      message: `Fast2SMS गेटवे प्रतिसाद: ${errMsg}`,
      gateway: 'Fast2SMS',
      errorDetails: errMsg
    };
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : 'Network Error';
    console.warn('Fast2SMS proxy request failed:', detail);

    return {
      success: false,
      message:
        'SMS सर्व्हरशी संपर्क झाला नाही. मोबाईलवर थेट SIM मधून SMS पाठवण्यासाठी "SIM द्वारे पाठवा" बटण वापरा.',
      gateway: 'Fast2SMS',
      errorDetails: detail
    };
  }
};
