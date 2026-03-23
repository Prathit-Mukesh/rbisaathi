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

  const { to_email, otp_code } = req.body || {};

  if (!to_email || !otp_code) {
    res.status(400).json({ success: false, error: 'Missing to_email or otp_code' });
    return;
  }

  if (!to_email.endsWith('@rbi.org.in')) {
    res.status(400).json({ success: false, error: 'Only @rbi.org.in addresses accepted' });
    return;
  }

  const EMAILJS_KEY = process.env.EMAILJS_KEY;
  const EMAILJS_SVC = process.env.EMAILJS_SVC;
  const EMAILJS_TPL = process.env.EMAILJS_TPL;

  if (!EMAILJS_KEY || !EMAILJS_SVC || !EMAILJS_TPL) {
    res.status(500).json({ success: false, error: 'Email service not configured' });
    return;
  }

  const payload = {
    service_id: EMAILJS_SVC,
    template_id: EMAILJS_TPL,
    user_id: EMAILJS_KEY,
    template_params: {
      to_email: to_email,
      otp_code: otp_code,
      app_name: 'RBI Sathi',
      valid_mins: '10'
    }
  };

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.status === 200) {
      res.status(200).json({ success: true });
    } else {
      const text = await response.text();
      console.error('EmailJS error:', response.status, text);
      res.status(400).json({ success: false, error: 'Email delivery failed' });
    }
  } catch (error) {
    console.error('EmailJS fetch error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
