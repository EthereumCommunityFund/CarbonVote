import { NextApiRequest, NextApiResponse } from 'next';
const axios = require('axios');
import { signMessage } from 'utils/generateSignature';

const privateKey = process.env.PRIVATE_KEY as string;
const poapApiKey = process.env.POAP_API_KEY;

const getEventVerification = async (address: any, eventId: number) => {
  try {
    const options = {
      method: 'GET',
      url: `https://api.poap.tech/actions/scan/${address}/${eventId}`,
      headers: {
        accept: 'application/json',
        'x-api-key': poapApiKey,
      },
    };

    axios.request(options).then(function (response: any) {
      console.log(response?.data);
      return response?.data;
    });
  } catch (error) {
    return 'Server error occurred while verifying your POAPs.';
  }
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!poapApiKey) {
      return res
        .status(500)
        .send('Server error: POAP API key not properly configured.');
    }

    // TODO: This implementation works for one address. Needs refactor for a multiple address solution
    const pollId = req.body.pollId; // Poll Id
    const address = req.body.address; // Owner's address

    // TODO: Fetch from supabase
    const eventIds = [118011, 60695]; // Array with POAP event ids fetched from Supabase

    if (!eventIds) {
      return res.status(400).send('No events found in request body.');
    }

    for (let index = 0; index < eventIds.length; index++) {
      const eventId = eventIds[index];
      const response = getEventVerification(address, eventId);

      // TODO: Add isVerified
      const isVerified = false;

      if (!isVerified) {
        return res.status(500).send("User doesn't own these POAPs.");
      }
    }

    let signedMessage = await signMessage(privateKey, address);

    res.status(200).json({ data: { signedMessage, address } });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error occurred while verifying your POAPs.');
  }
}

export default handler;
