// Email Alert Service for Kisan Saarthi
// Dispatches Price Alert Email via backend API /api/alerts/send-email with rate limiting

export interface SendEmailAlertParams {
  alertId?: string;
  toEmail: string;
  cropName: string;
  mandiName: string;
  currentPrice: number;
  targetPrice: number;
  condition?: 'ABOVE' | 'BELOW';
  farmerName?: string;
}

export interface SendEmailAlertResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// In-memory rate limiting map (3-second cooldown per alert ID)
const lastSentTimestamps = new Map<string, number>();

export async function sendPriceAlertEmail(params: SendEmailAlertParams): Promise<SendEmailAlertResult> {
  const {
    alertId = 'default',
    toEmail,
    cropName,
    mandiName,
    currentPrice,
    targetPrice,
    condition = 'ABOVE',
    farmerName = 'शेतकरी दादा'
  } = params;

  // Rate Limiting Check: 3 seconds cooldown per alert
  const now = Date.now();
  const lastSent = lastSentTimestamps.get(alertId) || 0;
  if (now - lastSent < 3000) {
    return {
      success: false,
      error: 'कृपया पुन्हा क्लिक करण्यापूर्वी ३ सेकंद थांबा (Please wait 3s between email requests).'
    };
  }
  lastSentTimestamps.set(alertId, now);

  if (!toEmail || !toEmail.includes('@')) {
    return {
      success: false,
      error: 'कृपया वैध ई-मेल पत्ता टाका (Please enter a valid email address).'
    };
  }

  try {
    const res = await fetch('/api/alerts/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        toEmail,
        cropName,
        mandiName,
        currentPrice,
        targetPrice,
        condition,
        farmerName
      })
    });

    let data: any = {};
    const textRes = await res.text();
    try {
      data = JSON.parse(textRes);
    } catch {
      data = { error: `सर्वर प्रतिसाद (HTTP ${res.status}): API मार्ग उपलब्ध नाही किंवा रीसेट झाला आहे.` };
    }

    if (res.ok && data.success) {
      return {
        success: true,
        messageId: data.messageId
      };
    } else {
      return {
        success: false,
        error: data.error || 'ई-मेल पाठवताना त्रुटी आली (Failed to send email).'
      };
    }
  } catch (err: any) {
    console.warn('[Email Alert Service Fetch Exception]:', err);
    return {
      success: false,
      error: err?.message || 'नेटवर्क त्रुटी आली. कृपया इंटरनेट कनेक्शन तपासा.'
    };
  }
}
