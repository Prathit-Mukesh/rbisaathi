export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.rbisaathi.co.in');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({error:'Method not allowed'}); return; }

  const { phone, otp } = req.body;
  if (!phone || !otp) { res.status(400).json({error:'Missing phone or otp'}); return; }

  const API_KEY = process.env.FAST2SMS_KEY;
  const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${API_KEY}&variables_values=${otp}&route=otp&numbers=${phone}`;

  try {
    const r = await fetch(url, { method: 'GET', headers: { 'cache-control': 'no-cache' } });
    const data = await r.json();
    if (data.return === true) {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false, error: data.message || 'SMS failed' });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}
