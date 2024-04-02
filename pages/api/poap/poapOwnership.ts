import { NextApiRequest, NextApiResponse } from 'next';
import getPoapOwnership from 'utils/getPoapOwnership';

const poapApiKey = process.env.POAP_API_KEY ?? "";

async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {

        const voter_identifier = req.query.voter_identifier as string; // voter_identifier
        const eventId = req.query.eventId as string; // eventId

        if (!voter_identifier || !eventId) return res.status(404).send("An identifier for the voter and an EventId are required for this");

        const response = await getPoapOwnership(poapApiKey, voter_identifier, eventId)
        return res.status(200).json(response.data);

    } catch (error) {
        console.error('Poap ownership error', error);
        return res.status(500).send(`Server error occurred while  looking for POAPs. Error: ${error}`);
    }
}

export default handler;
