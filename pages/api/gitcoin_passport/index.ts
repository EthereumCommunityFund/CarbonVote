import { NextApiRequest, NextApiResponse } from 'next';

const API_BASE_URL = 'https://api.scorer.gitcoin.co/registry';
const gitcoinApiKey = process.env.GITCOIN_API_KEY ?? '';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { address, scorerId } = req.body;
  const requestBody = {
    address,
    scorer_id: scorerId,
  };
  console.log(gitcoinApiKey);
  const headers = {
    'Content-Type': 'application/json',
    'X-API-KEY': gitcoinApiKey,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/submit-passport`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send('Server error occurred while checking gitcoin passport score.');
  }
}

export default handler;
