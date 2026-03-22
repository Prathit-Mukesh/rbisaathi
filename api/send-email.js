export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.rbisaathi.co.in');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({error:'Method not allowed'}); return; }

  const { to_email, otp_code } = req.body;
  if (!to_email || !otp_code) { res.status(400).json({error:'Missing fields'}); return; }

  const payload = {
    service_id: process.env.EMAILJS_SVC,
    template_id: process.env.EMAILJS_TPL,
    user_id: process.env.EMAILJS_KEY,
    template_params: { to_email, otp_code, app_name: 'RBI Sathi', valid_mins: '10' }
  };

  try {
    const r = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (r.status === 200) {
      res.status(200).json({ success: true });
    } else {
      const t = await r.text();
      res.status(400).json({ success: false, error: t });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}
