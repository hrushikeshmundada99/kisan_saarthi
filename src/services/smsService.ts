// Real SMS Delivery Service for Indian Mobile Numbers via Fast2SMS & Twilio Gateways

const FAST2SMS_STORAGE_KEY = 'KISAN_SAARTHI_FAST2SMS_KEY';
export const DEFAULT_FAST2SMS_KEY = 'kBe7PjfdGw5si89uMnyWq4LCAcFKlm0pYRX2hSvaOHoUJZVQtbsV8xvhO3o2a6fHizR497PEXBFWbAkU';

export interface SmsSendResponse {
  success: boolean;
  message: string;
  requestId?: string;
  gateway: 'Fast2SMS' | 'Twilio' | 'Native';
  errorDetails?: string;
}

// Get stored Fast2SMS API key or default key provided by user
export const getFast2SmsKey = (): string => {
  return (
    localStorage.getItem(FAST2SMS_STORAGE_KEY) ||
    import.meta.env.VITE_FAST2SMS_API_KEY ||
    DEFAULT_FAST2SMS_KEY
  );
};

export const setFast2SmsKey = (key: string): void => {
  localStorage.setItem(FAST2SMS_STORAGE_KEY, key.trim());
};

// Send real SMS to Indian mobile numbers using Fast2SMS Quick Route (Bypassing CORS via proxy/serverless)
export const sendRealSmsToIndianMobile = async (
  mobileNumber: string,
  messageText: string,
  customApiKey?: string
): Promise<SmsSendResponse> => {
  const cleanNumber = mobileNumber.replace(/\D/g, '').slice(-10);

  if (cleanNumber.length !== 10) {
    return {
      success: false,
      message: 'कृपया १०-अंकी वैध मोबाईल नंबर प्रविष्ट करा',
      gateway: 'Fast2SMS'
    };
  }

  const apiKey = customApiKey || getFast2SmsKey();

  // 1. Try Proxied Endpoint (/api/fast2sms) with route=v3 / route=q
  try {
    const proxyUrl = `/api/fast2sms?authorization=${encodeURIComponent(apiKey)}&route=v3&sender_id=TXTIND&message=${encodeURIComponent(
      messageText
    )}&numbers=${cleanNumber}`;

    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'cache-control': 'no-cache'
      }
    });

    if (response.ok) {
      const result = await response.json();
      if (result && result.return === true) {
        return {
          success: true,
          message: `+91 ${cleanNumber} वर प्रत्यक्ष SMS यशस्वीरीत्या पाठवला! (Delivered via Fast2SMS)`,
          requestId: result.request_id || `req-${Date.now()}`,
          gateway: 'Fast2SMS'
        };
      } else {
        const errMsg = Array.isArray(result?.message) ? result.message.join(', ') : result?.message || 'SMS Gateway Error';
        return {
          success: false,
          message: `Fast2SMS गेटवे प्रतिसाद: ${errMsg}`,
          gateway: 'Fast2SMS',
          errorDetails: errMsg
        };
      }
    }
  } catch (proxyErr) {
    console.warn('Proxy route attempt warning, trying direct route...', proxyErr);
  }

  // 2. Direct Fallback
  try {
    const directUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(
      apiKey
    )}&route=v3&sender_id=TXTIND&message=${encodeURIComponent(messageText)}&numbers=${cleanNumber}`;

    const response = await fetch(directUrl, {
      method: 'GET',
      headers: {
        'cache-control': 'no-cache'
      }
    });

    const result = await response.json();

    if (result && result.return === true) {
      return {
        success: true,
        message: `+91 ${cleanNumber} वर प्रत्यक्ष SMS यशस्वीरीत्या पाठवला! (Delivered via Fast2SMS)`,
        requestId: result.request_id || `req-${Date.now()}`,
        gateway: 'Fast2SMS'
      };
    } else {
      const errMsg = Array.isArray(result?.message) ? result.message.join(', ') : result?.message || 'Gateway Error';
      return {
        success: false,
        message: `Fast2SMS गेटवे प्रतिसाद: ${errMsg}`,
        gateway: 'Fast2SMS',
        errorDetails: errMsg
      };
    }
  } catch (directErr: any) {
    console.warn('Direct Fast2SMS fetch note:', directErr);

    return {
      success: false,
      message: 'Fast2SMS सर्व्हरशी संपर्क झाला नाही. मोबाईलवर थेट SIM मधून SMS पाठवण्यासाठी "SIM द्वारे पाठवा" बटण वापरा.',
      gateway: 'Fast2SMS',
      errorDetails: directErr?.message || 'CORS / Network Error'
    };
  }
};
