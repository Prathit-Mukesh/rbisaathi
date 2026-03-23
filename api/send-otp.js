export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const { phone, otp } = req.body || {};

  if (!phone || !otp) {
    res.status(400).json({ success: false, error: 'Missing phone or otp' });
    return;
  }

  const API_KEY = process.env.FAST2SMS_KEY;

  if (!API_KEY) {
    res.status(500).json({ success: false, error: 'SMS service not configured' });
    return;
  }

  try {
    const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${API_KEY}&variables_values=${otp}&route=otp&numbers=${phone}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'cache-control': 'no-cache' }
    });

    const data = await response.json();

    if (data.return === true) {
      res.status(200).json({ success: true });
    } else {
      console.error('Fast2SMS error:', data);
      res.status(400).json({ success: false, error: data.message || 'SMS delivery failed' });
    }
  } catch (error) {
    console.error('Fast2SMS fetch error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
