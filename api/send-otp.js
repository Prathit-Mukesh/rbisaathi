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
    // Using service_implicit route — works with existing balance, no KYC needed
    const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${API_KEY}&variables_values=${otp}&route=otp&numbers=${phone}&flash=0`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'cache-control': 'no-cache' }
    });
    const data = await response.json();
    
    if (data.return === true) {
      res.status(200).json({ success: true });
    } else {
      // Fallback: try service_implicit route
      const url2 = `https://www.fast2sms.com/dev/bulkV2?authorization=${API_KEY}&message=Your+RBI+Sathi+OTP+is+${otp}.+Valid+10+mins.&route=v3&numbers=${phone}`;
      const r2 = await fetch(url2, { method: 'GET', headers: { 'cache-control': 'no-cache' } });
      const d2 = await r2.json();
      if (d2.return === true) {
        res.status(200).json({ success: true });
      } else {
        console.error('Fast2SMS both routes failed:', data, d2);
        res.status(400).json({ success: false, error: d2.message || data.message });
      }
    }
  } catch (error) {
    console.error('Fast2SMS error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
