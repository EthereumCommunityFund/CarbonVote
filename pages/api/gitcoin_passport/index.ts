/*import { NextApiRequest, NextApiResponse } from 'next';
import { getPassportScore } from '../../../utils/getPassportScore';
import { submitPassport } from '../../../utils/getPassportScore';

export default async function getscore(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { address, scorerId } = req.query;
        const apiKey = process.env.GITCOIN_API_KEY;

        let scorerIdStr = Array.isArray(scorerId) ? scorerId[0] : scorerId;
        console.log(address, scorerIdStr);
        if (!address || !scorerId || !apiKey) {
            return res.status(400).json({ message: 'Missing required parameters' });
        }


        await submitPassport(address, scorerId, apiKey);

        const score = await getPassportScore(address, scorerIdStr, apiKey);

        res.status(200).json(score);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'An error occurred' });
        }
    }
}*/
