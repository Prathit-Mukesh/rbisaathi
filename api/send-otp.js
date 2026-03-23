export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ success: false }); return; }

  const { phone, otp } = req.body || {};
  if (!phone || !otp) { res.status(400).json({ success: false, error: 'Missing fields' }); return; }

  const API_KEY = process.env.FAST2SMS_KEY;

  try {
    const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${API_KEY}&variables_values=${otp}&route=otp&numbers=${phone}`;
    const response = await fetch(url, { method: 'GET', headers: { 'cache-control': 'no-cache' } });
    const data = await response.json();
    console.log('Fast2SMS response:', JSON.stringify(data));
    if (data.return === true) {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false, error: data.message, code: data.status_code });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
