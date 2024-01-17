import { NextApiRequest, NextApiResponse } from 'next';
const axios = require('axios');

const poapApiKey = process.env.POAP_API_KEY;

async function handler(req: NextApiRequest, res: NextApiResponse) {
    let response;

    try {
        const eventId = req.query.eventId; // Event Id
        const address = req.query.address; // Address text

        // We check ownership and receive the event's details
        if (!!address) {
            try {
                const eventOwnership = {
                    method: 'GET',
                    url: `https://api.poap.tech/actions/scan/${address}/${eventId}`,
                    headers: {
                        accept: 'application/json',
                        'x-api-key': poapApiKey
                    }
                };
                response = await axios.request(eventOwnership);
            } catch (error: any) {
                console.log("🚀 ~ handler ~ error:", error)
                // Check if error is not 404, then throw
                if (!error.response || error.response.status !== 404) {
                    throw error;
                }
                // For 404, continue to the next endpoint
            }
        }

        // If there's no owner we won't receive event details and need to look them up
        if (!response?.data?.owner) {
            const eventDetails = {
                method: 'GET',
                url: `https://api.poap.tech/events/id/${eventId}`,
                headers: {
                    accept: 'application/json',
                    'x-api-key': poapApiKey
                }
            };
            const eventdetails = await axios.request(eventDetails);
            response = {
                data: {
                    event: eventdetails.data,
                    tokenId: null,
                    owner: null
                }
            }
        }

        return res.status(200).json(response.data);

    } catch (error) {
        console.error(error);
        return res.status(500).send("Server error occurred while looking for POAPs.");
    }
}


export default handler;
